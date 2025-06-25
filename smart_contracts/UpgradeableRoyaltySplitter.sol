// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UpgradeableRoyaltySplitter
/// @notice Ultra-modern, upgradeable, unstoppable royalty splitter for NFTs, music, and digital assets. Handles dynamic rights, multi-chain, and on-chain/off-chain integration.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UpgradeableRoyaltySplitter is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    struct Recipient {
        address account;
        uint96 bps; // basis points, 10000 = 100%
        bool active;
    }

    Recipient[] public recipients;
    uint256 public totalBps;
    event RecipientAdded(address indexed account, uint96 bps);
    event RecipientUpdated(uint256 indexed idx, address account, uint96 bps, bool active);
    event RoyaltyDistributed(address indexed to, uint256 amount, address token);
    event RoyaltyReceived(address indexed from, uint256 amount, address token);

    // --- Upgradeability ---
    function initialize(address owner_) public initializer {
        __Ownable_init(owner_);
        __UUPSUpgradeable_init();
        totalBps = 0;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Recipient Management ---

    function addRecipient(address account, uint96 bps) external onlyOwner {
        require(account != address(0), "Zero address");
        require(bps > 0, "Zero bps");
        require(totalBps + bps <= 10000, "Exceeds 100%");
        recipients.push(Recipient(account, bps, true));
        totalBps += bps;
        emit RecipientAdded(account, bps);
    }

    function updateRecipient(uint256 idx, address account, uint96 bps, bool active) external onlyOwner {
        require(idx < recipients.length, "Invalid idx");
        require(account != address(0), "Zero address");
        totalBps = totalBps - recipients[idx].bps + bps;
        require(totalBps <= 10000, "Exceeds 100%");
        recipients[idx] = Recipient(account, bps, active);
        emit RecipientUpdated(idx, account, bps, active);
    }

    function getRecipients() external view returns (Recipient[] memory) {
        return recipients;
    }

    // --- Royalty Distribution (Native + ERC20) ---

    receive() external payable {
        emit RoyaltyReceived(msg.sender, msg.value, address(0));
        _distribute(msg.value, address(0));
    }

    function distributeERC20(address token, uint256 amount) external {
        require(token != address(0), "Zero token");
        IERC20 erc = IERC20(token);
        require(erc.transferFrom(msg.sender, address(this), amount), "TransferFrom failed");
        emit RoyaltyReceived(msg.sender, amount, token);
        _distribute(amount, token);
    }

    function _distribute(uint256 total, address token) internal {
        uint256 sum;
        for (uint256 i = 0; i < recipients.length; i++) {
            Recipient memory r = recipients[i];
            if (!r.active || r.bps == 0) continue;
            uint256 payout = (total * r.bps) / 10000;
            sum += payout;
            if (token == address(0)) {
                (bool sent,) = r.account.call{value: payout}("");
                require(sent, "Native payout failed");
            } else {
                IERC20(token).transfer(r.account, payout);
            }
            emit RoyaltyDistributed(r.account, payout, token);
        }
        // If any dust remains, send to owner as admin fee
        uint256 dust = total - sum;
        if (dust > 0) {
            if (token == address(0)) {
                (bool sent,) = owner().call{value: dust}("");
                require(sent, "Admin payout failed");
            } else {
                IERC20(token).transfer(owner(), dust);
            }
            emit RoyaltyDistributed(owner(), dust, token);
        }
    }

    // --- Multi-chain/Off-chain Integration ---

    // Emits event for off-chain or cross-chain payout hooks
    function emitRoyaltyEvent(address payer, uint256 amount, address token) external onlyOwner {
        emit RoyaltyReceived(payer, amount, token);
    }
}
