// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChainRoyaltySplitter
/// @notice Unstoppable, modular, programmable royalty/income splitter for ERC20/native assets, with plugin logic, vesting, and streaming support. NFT/DeFi/DAO ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISplitterPlugin {
    function beforeRelease(uint256 splitterId, address account, uint256 amount) external view returns (bool allowed);
}

contract OnChainRoyaltySplitter is Ownable {
    struct PayeeInfo {
        uint256 shares;        // Share in basis points (1e4 = 100%)
        uint256 released;      // Total released to payee
        uint256 vestingStart;  // Timestamp for vesting start
        uint256 vestingDuration; // Vesting duration in seconds
    }

    struct Splitter {
        address[] payees;
        mapping(address => PayeeInfo) payeeInfo;
        IERC20 token; // address(0) = native
        uint256 totalShares; // Sum of shares (should = 1e4)
        uint256 totalReleased;
        uint256 createdAt;
        address plugin; // optional (for streaming, bonus, etc.)
        bool active;
    }

    uint256 public splitterCount;
    mapping(uint256 => Splitter) private splitters;

    event SplitterCreated(uint256 indexed splitterId, address[] payees, address token, uint256[] shares, address plugin);
    event PaymentReceived(uint256 indexed splitterId, address indexed from, uint256 amount, address token);
    event PaymentReleased(uint256 indexed splitterId, address indexed to, uint256 amount, address token);
    event PayeeUpdated(uint256 indexed splitterId, address payee, uint256 newShares);
    event PluginSet(uint256 indexed splitterId, address plugin);

    modifier splitterExists(uint256 splitterId) {
        require(splitterId < splitterCount, "No such splitter");
        _;
    }
    modifier onlyPayee(uint256 splitterId) {
        require(splitters[splitterId].payeeInfo[msg.sender].shares > 0, "Not payee");
        _;
    }

    // --- Splitter Creation ---

    function createSplitter(
        address[] calldata payees,
        uint256[] calldata shares,
        address token,
        uint256[] calldata vestingStarts,
        uint256[] calldata vestingDurations,
        address plugin
    ) external onlyOwner returns (uint256 splitterId) {
        require(payees.length > 0, "No payees");
        require(payees.length == shares.length, "Length mismatch");
        require(payees.length == vestingStarts.length, "Vesting length mismatch");
        require(payees.length == vestingDurations.length, "Vesting length mismatch");

        uint256 total;
        splitterId = splitterCount++;
        Splitter storage s = splitters[splitterId];

        for (uint256 i = 0; i < payees.length; i++) {
            require(payees[i] != address(0), "Zero payee");
            require(shares[i] > 0, "Zero share");
            s.payees.push(payees[i]);
            s.payeeInfo[payees[i]] = PayeeInfo({
                shares: shares[i],
                released: 0,
                vestingStart: vestingStarts[i],
                vestingDuration: vestingDurations[i]
            });
            total += shares[i];
        }
        require(total == 1e4, "Total shares != 100%");
        s.token = IERC20(token);
        s.totalShares = total;
        s.createdAt = block.timestamp;
        s.plugin = plugin;
        s.active = true;

        emit SplitterCreated(splitterId, payees, token, shares, plugin);
    }

    // --- Receiving Payment ---

    receive() external payable {
        // Native payments must use splitterId in msg.data (if needed)
    }

    function deposit(uint256 splitterId, uint256 amount) external payable splitterExists(splitterId) {
        Splitter storage s = splitters[splitterId];
        if (address(s.token) == address(0)) {
            require(msg.value == amount, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(s.token.transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
        }
        emit PaymentReceived(splitterId, msg.sender, amount, address(s.token));
    }

    // --- Release Payment ---

    function releasable(uint256 splitterId, address account) public view splitterExists(splitterId) returns (uint256) {
        Splitter storage s = splitters[splitterId];
        PayeeInfo storage p = s.payeeInfo[account];
        if (p.shares == 0) return 0;
        uint256 totalReceived;
        if (address(s.token) == address(0)) {
            totalReceived = address(this).balance + s.totalReleased;
        } else {
            totalReceived = s.token.balanceOf(address(this)) + s.totalReleased;
        }
        uint256 vested = _vestedAmount(p, totalReceived);
        return vested > p.released ? vested - p.released : 0;
    }

    function release(uint256 splitterId) external splitterExists(splitterId) onlyPayee(splitterId) {
        Splitter storage s = splitters[splitterId];
        PayeeInfo storage p = s.payeeInfo[msg.sender];
        require(s.active, "Splitter not active");
        uint256 payment = releasable(splitterId, msg.sender);
        require(payment > 0, "Nothing to release");

        // Plugin logic (optional)
        if (s.plugin != address(0)) {
            require(ISplitterPlugin(s.plugin).beforeRelease(splitterId, msg.sender, payment), "Plugin denied");
        }

        p.released += payment;
        s.totalReleased += payment;

        if (address(s.token) == address(0)) {
            payable(msg.sender).transfer(payment);
        } else {
            s.token.transfer(msg.sender, payment);
        }
        emit PaymentReleased(splitterId, msg.sender, payment, address(s.token));
    }

    function _vestedAmount(PayeeInfo storage p, uint256 totalReceived) internal view returns (uint256) {
        // Linear vesting, instant if duration = 0
        if (block.timestamp < p.vestingStart) return 0;
        uint256 shareAmount = (totalReceived * p.shares) / 1e4;
        if (p.vestingDuration == 0) return shareAmount;
        uint256 elapsed = block.timestamp - p.vestingStart;
        if (elapsed >= p.vestingDuration) return shareAmount;
        return (shareAmount * elapsed) / p.vestingDuration;
    }

    // --- Admin Controls ---

    function setPayeeShares(uint256 splitterId, address payee, uint256 newShares) external onlyOwner splitterExists(splitterId) {
        Splitter storage s = splitters[splitterId];
        require(newShares > 0, "Zero share");
        uint256 total = s.totalShares - s.payeeInfo[payee].shares + newShares;
        require(total == 1e4, "Total shares != 100%");
        s.payeeInfo[payee].shares = newShares;
        s.totalShares = total;
        emit PayeeUpdated(splitterId, payee, newShares);
    }

    function setPlugin(uint256 splitterId, address plugin) external onlyOwner splitterExists(splitterId) {
        splitters[splitterId].plugin = plugin;
        emit PluginSet(splitterId, plugin);
    }

    function deactivateSplitter(uint256 splitterId) external onlyOwner splitterExists(splitterId) {
        splitters[splitterId].active = false;
    }

    // --- View Functions ---

    function getSplitter(uint256 splitterId) external view splitterExists(splitterId) returns (
        address[] memory payees,
        uint256[] memory shares,
        address token,
        uint256[] memory vestingStarts,
        uint256[] memory vestingDurations,
        address plugin,
        bool active
    ) {
        Splitter storage s = splitters[splitterId];
        payees = s.payees;
        shares = new uint256[](payees.length);
        vestingStarts = new uint256[](payees.length);
        vestingDurations = new uint256[](payees.length);
        for (uint256 i = 0; i < payees.length; i++) {
            PayeeInfo storage p = s.payeeInfo[payees[i]];
            shares[i] = p.shares;
            vestingStarts[i] = p.vestingStart;
            vestingDurations[i] = p.vestingDuration;
        }
        return (payees, shares, address(s.token), vestingStarts, vestingDurations, s.plugin, s.active);
    }

    function getPayeeInfo(uint256 splitterId, address payee) external view splitterExists(splitterId) returns (
        uint256 shares,
        uint256 released,
        uint256 vestingStart,
        uint256 vestingDuration
    ) {
        PayeeInfo storage p = splitters[splitterId].payeeInfo[payee];
        return (p.shares, p.released, p.vestingStart, p.vestingDuration);
    }
}
