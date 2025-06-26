// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChain/ERC20/IERC20.sol";

interface ISplitPlugin {
    function getShares(address[] calldata recipients, uint256 totalAmount) external view returns (uint256[] memory);
}

interface IPayoutPlugin {
    function payout(address recipient, address token, uint256 amount) external;
}

contract OnChainRoyaltyDistributor is Ownable {
    struct RoyaltyConfig {
        address[] recipients;
        uint256[] shares; // in basis points (sum = 10000)
        address splitPlugin;
        address payoutPlugin;
        bool active;
    }

    mapping(uint256 => RoyaltyConfig) public configs;
    uint256 public configCount;

(configId, recipients, shares, splitPlugin, payoutPlugin);
    }

    function updateRoyaltyConfig(
        uint256 configId,
        address[] calldata recipients,
        uint256[] calldata shares,
        address splitPlugin,
        address payoutPlugin
    ) external onlyOwner {
        RoyaltyConfig storage c = configs[configId];
        require(c.active, "Inactive config");
        require(recipients.length == shares.length && recipients.length > 0, "Invalid recipients/shares");
        uint256 sum;
        for (uint256 i = 0; i < shares.length; i++) sum += shares[i];
        require(sum, address(this), amount);
        uint256[] memory payouts = _getPayouts(c, amount);
        _distributeERC20(c, token, payouts, amount);
        emit RoyaltyPaid(configId, msg.sender, token, amount, c.recipients, payouts);
    }

    // --- Internal Split & Distribution ---

    function _getPayouts(RoyaltyConfig storage c, uint256 totalAmount) internal view returns (uint256[] memory) {
        if (c.splitPlugin != address(0)) {
            return ISplitPlugin(c.splitPlugin).getShares(c.recipients, totalAmount);
       .length; i++) {
            payouts[i] = (totalAmount * c.shares[i]) / 10000;
        }
        return payouts;
    }

    function _distributeNative(RoyaltyConfig storage c, uint256[] memory payouts, uint256 total) internal {
        if (c.payoutPlugin != address(0)) {
            for (uint256 i = 0; i < c.recipients.length; i++) {
                IPayoutPlugin(c.payoutPlugin).payout(c.recipients[i], address(0), payouts[i]);
            }
        } else {
            for (uint256 i = 0; i        }
        // Any dust (rounding error) stays in the contract
    }

    function _distributeERC20(RoyaltyConfig storage c, address token, uint256[] memory payouts, uint256 total) internal {
        if (c.payoutPlugin != address(0)) {
            for (uint256 i = 0; i < c.recipients.length; i++) {
                IPayoutPlugin(c.payoutPlugin).payout(c.recipients[i], token, payouts[i]);
            }
        } else {
            for (uint256 i = 0; i < c.recipients.length; i++) {
                IERC20(token).transfer(c.recipients[i], payouts[i]);
            }
        }
        // Any dust (rounding error) stays in the contract
    }

    // --- View Functions ---

    function getRoyaltyConfig(uint256 configId) external view returns (
        address[] memory recipients,
        uint256[] memory shares,
        address splitPlugin,
        address payoutPlugin,
        bool active
    ) {
        RoyaltyConfig storage c = configs[configId];
        return (
            c.recipients,
            c.shares,
            c.splitPlugin,
            c.payoutPlugin,
            c.active
        );
    }
}
