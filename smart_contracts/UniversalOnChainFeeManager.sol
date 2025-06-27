// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainFeeManager
/// @notice Modular, unstoppable on-chain fee manager for ERC20/native payments. Supports fixed/percentage/tiered/plugin logic, splits, burning, programmable withdrawal. DAO/protocol/DApp ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFeePlugin {
    function calculateFee(uint256 policyId, address payer, address token, uint256 amount, bytes calldata data) external view returns (uint256 fee, address recipient);
    function canWithdraw(address recipient, uint256 policyId, uint256 feeAmount) external view returns (bool);
}

contract UniversalOnChainFeeManager is Ownable {
    enum AssetType { Native, ERC20 }

    struct FeePolicy {
        AssetType assetType;
        address token;
        uint256 fixedFee;
        uint256 percentFee; // e.g., 250 = 2.5%
        address plugin;
        address defaultRecipient;
        bool active;
        string metadataURI;
        uint256 collected;
        uint256 createdAt;
    }

    uint256 public policyCount;
    mapping(uint256 => FeePolicy) public policies;
    mapping(uint256 => mapping(address => uint256)) public userPaid; // policyId => payer => paid

    event PolicyCreated(
        uint256 indexed policyId,
        AssetType assetType,
        address token,
        uint256 fixedFee,
        uint256 percentFee,
        address plugin,
        address defaultRecipient,
        string metadataURI
    );
    event FeePaid(uint256 indexed policyId, address indexed payer, address token, uint256 amount, uint256 fee, address recipient);
    event Withdrawn(uint256 indexed policyId, address indexed recipient, uint256 amount);

    // --- Create Fee Policy ---

    function createPolicy(
        AssetType assetType,
        address token,
        uint256 fixedFee,
        uint256 percentFee,
        address plugin,
        address defaultRecipient,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 policyId) {
        require(fixedFee > 0 || percentFee > 0, "Zero fee");
        policyId = policyCount++;
        policies[policyId] = FeePolicy({
            assetType: assetType,
            token: token,
            fixedFee: fixedFee,
            percentFee: percentFee,
            plugin: plugin,
            defaultRecipient: defaultRecipient,
            active: true,
            metadataURI: metadataURI,
            collected: 0,
            createdAt: block.timestamp
        });
        emit PolicyCreated(policyId, assetType, token, fixedFee, percentFee, plugin, defaultRecipient, metadataURI);
    }

    function setActive(uint256 policyId, bool active) external onlyOwner {
        policies[policyId].active = active;
    }

    // --- Pay Fee ---

    function payFee(uint256 policyId, uint256 amount, bytes calldata pluginData) external payable {
        FeePolicy storage p = policies[policyId];
        require(p.active, "Inactive policy");
        uint256 fee;
        address recipient;
        if (p.plugin != address(0)) {
            (fee, recipient) = IFeePlugin(p.plugin).calculateFee(policyId, msg.sender, p.token, amount, pluginData);
        } else {
            // Default: fixed + percent
            fee = p.fixedFee + (amount * p.percentFee) / 10000;
            recipient = p.defaultRecipient;
        }
        require(fee > 0, "Zero fee");
        if (p.assetType == AssetType.Native) {
            require(msg.value == amount + fee, "ETH mismatch");
            if (fee > 0 && recipient != address(0)) payable(recipient).transfer(fee);
        } else if (p.assetType == AssetType.ERC20) {
            require(msg.value == 0, "No ETH for ERC20");
            if (amount > 0) IERC20(p.token).transferFrom(msg.sender, address(this), amount);
            if (fee > 0 && recipient != address(0)) IERC20(p.token).transferFrom(msg.sender, recipient, fee);
        }
        userPaid[policyId][msg.sender] += fee;
        p.collected += fee;
        emit FeePaid(policyId, msg.sender, p.token, amount, fee, recipient);
    }

    // --- Withdraw (for protocol/DAO treasury, if needed) ---

    function withdraw(uint256 policyId, uint256 amount) external {
        FeePolicy storage p = policies[policyId];
        require(amount > 0 && amount <= p.collected, "Invalid withdraw");
        if (p.plugin != address(0)) {
            require(IFeePlugin(p.plugin).canWithdraw(msg.sender, policyId, amount), "Plugin blocked");
        }
        p.collected -= amount;
        if (p.assetType == AssetType.Native) {
            payable(msg.sender).transfer(amount);
        } else if (p.assetType == AssetType.ERC20) {
            IERC20(p.token).transfer(msg.sender, amount);
        }
        emit Withdrawn(policyId, msg.sender, amount);
    }

    // --- View ---

    function getPolicy(uint256 policyId) external view returns (
        AssetType assetType,
        address token,
        uint256 fixedFee,
        uint256 percentFee,
        address plugin,
        address defaultRecipient,
        bool active,
        string memory metadataURI,
        uint256 collected,
        uint256 createdAt
    ) {
        FeePolicy storage p = policies[policyId];
        return (
            p.assetType,
            p.token,
            p.fixedFee,
            p.percentFee,
            p.plugin,
            p.defaultRecipient,
            p.active,
            p.metadataURI,
            p.collected,
            p.createdAt
        );
    }

    function paidBy(address user, uint256 policyId) external view returns (uint256) {
        return userPaid[policyId][user];
    }
}
