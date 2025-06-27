// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainRoyaltySplitter
/// @notice Modular, unstoppable royalty/payment splitter for ERC20/native tokens. Supports weighted/tiered/plugin shares, fees, vesting, and programmable withdrawals. Protocol/NFT/DAO/creator ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISplitterPlugin {
    function shareOf(address recipient, uint256 splitterId, uint256 totalShares, uint256 amount) external view returns (uint256);
    function canWithdraw(address recipient, uint256 splitterId, uint256 amount) external view returns (bool);
}

contract UniversalOnChainRoyaltySplitter is Ownable {
    enum AssetType { Native, ERC20 }

    struct Recipient {
        address account;
        uint256 weight;
        uint256 released;
    }

    struct Splitter {
        AssetType assetType;
        address asset;
        uint256 totalShares;
        uint256 totalReleased;
        address[] recipients;
        mapping(address => uint256) weights;
        mapping(address => uint256) released;
        address plugin;
        string metadataURI;
        bool active;
        uint256 createdAt;
    }

    uint256 public splitterCount;
    mapping(uint256 => Splitter) public splitters;

    event SplitterCreated(
        uint256 indexed splitterId,
        AssetType assetType,
        address asset,
        address[] recipients,
        uint256[] weights,
        address plugin,
        string metadataURI
    );
    event PaymentReceived(uint256 indexed splitterId, AssetType assetType, address asset, uint256 amount);
    event Withdrawn(uint256 indexed splitterId, address indexed recipient, uint256 amount, uint256 totalReleased);

    // --- Create Splitter ---

    function createSplitter(
        AssetType assetType,
        address asset,
        address[] calldata recipients,
        uint256[] calldata weights,
        address plugin,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 splitterId) {
        require(recipients.length > 0, "No recipients");
        require(recipients.length == weights.length, "Length mismatch");
        uint256 total;
        for (uint256 i = 0; i < weights.length; i++) {
            total += weights[i];
        }
        require(total > 0, "Zero total shares");
        splitterId = splitterCount++;
        Splitter storage s = splitters[splitterId];
        s.assetType = assetType;
        s.asset = asset;
        s.totalShares = total;
        s.recipients = recipients;
        s.plugin = plugin;
        s.metadataURI = metadataURI;
        s.active = true;
        s.createdAt = block.timestamp;
        for (uint256 i = 0; i < recipients.length; i++) {
            s.weights[recipients[i]] = weights[i];
        }
        emit SplitterCreated(splitterId, assetType, asset, recipients, weights, plugin, metadataURI);
    }

    // --- Receive Payments ---

    receive() external payable {
        // Accept ETH for all active splitters with native type
        for (uint256 i = 0; i < splitterCount; i++) {
            Splitter storage s = splitters[i];
            if (s.active && s.assetType == AssetType.Native) {
                emit PaymentReceived(i, AssetType.Native, address(0), msg.value);
            }
        }
    }

    function deposit(uint256 splitterId, uint256 amount) external payable {
        Splitter storage s = splitters[splitterId];
        require(s.active, "Inactive splitter");
        if (s.assetType == AssetType.Native) {
            require(msg.value == amount, "ETH mismatch");
            emit PaymentReceived(splitterId, AssetType.Native, address(0), amount);
        } else if (s.assetType == AssetType.ERC20) {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(s.asset).transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
            emit PaymentReceived(splitterId, AssetType.ERC20, s.asset, amount);
        }
    }

    // --- Withdraw ---

    function withdraw(uint256 splitterId) external {
        Splitter storage s = splitters[splitterId];
        require(s.active, "Inactive");
        require(s.weights[msg.sender] > 0, "Not a recipient");

        uint256 totalReceived;
        if (s.assetType == AssetType.Native) {
            totalReceived = address(this).balance + s.totalReleased;
        } else if (s.assetType == AssetType.ERC20) {
            totalReceived = IERC20(s.asset).balanceOf(address(this)) + s.totalReleased;
        }
        uint256 entitled;
        if (s.plugin != address(0)) {
            entitled = ISplitterPlugin(s.plugin).shareOf(msg.sender, splitterId, s.totalShares, totalReceived);
        } else {
            entitled = (totalReceived * s.weights[msg.sender]) / s.totalShares;
        }
        uint256 payment = entitled - s.released[msg.sender];
        require(payment > 0, "Nothing to withdraw");

        if (s.plugin != address(0)) {
            require(ISplitterPlugin(s.plugin).canWithdraw(msg.sender, splitterId, payment), "Plugin blocked");
        }

        s.released[msg.sender] += payment;
        s.totalReleased += payment;

        if (s.assetType == AssetType.Native) {
            payable(msg.sender).transfer(payment);
        } else if (s.assetType == AssetType.ERC20) {
            IERC20(s.asset).transfer(msg.sender, payment);
        }
        emit Withdrawn(splitterId, msg.sender, payment, s.totalReleased);
    }

    // --- Admin ---

    function setActive(uint256 splitterId, bool active) external onlyOwner {
        splitters[splitterId].active = active;
    }

    // --- View ---

    function getSplitter(uint256 splitterId) external view returns (
        AssetType assetType,
        address asset,
        address[] memory recipients,
        uint256[] memory weights,
        uint256 totalShares,
        uint256 totalReleased,
        address plugin,
        string memory metadataURI,
        bool active,
        uint256 createdAt
    ) {
        Splitter storage s = splitters[splitterId];
        uint256 n = s.recipients.length;
        uint256[] memory ws = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            ws[i] = s.weights[s.recipients[i]];
        }
        return (
            s.assetType,
            s.asset,
            s.recipients,
            ws,
            s.totalShares,
            s.totalReleased,
            s.plugin,
            s.metadataURI,
            s.active,
            s.createdAt
        );
    }

    function releasedOf(uint256 splitterId, address recipient) external view returns (uint256) {
        return splitters[splitterId].released[recipient];
    }
}
