// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DynamicFeeManager
/// @notice Ultra high-tech, modular, AI/ML-ready dynamic fee engine for DeFi and dApps. Supports user tiers, oracles, and external optimizers.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFeeOracle {
    function getFee(address asset, address user, bytes calldata context) external view returns (uint256); // fee in bps
}

contract DynamicFeeManager is Ownable {
    struct FeeOverride {
        bool exists;
        uint256 feeBps; // fee in basis points (bps), 1 bps = 0.01%
    }

    // Global default fee
    uint256 public defaultFeeBps = 30; // 0.30%
    // Asset-specific default fee
    mapping(address => uint256) public assetFeeBps;
    // User-specific override: asset => user => FeeOverride
    mapping(address => mapping(address => FeeOverride)) public feeOverrides;

    IFeeOracle public feeOracle;
    bool public oracleEnabled;

    event DefaultFeeChanged(uint256 newDefaultFee);
    event AssetFeeChanged(address indexed asset, uint256 newFee);
    event FeeOverrideSet(address indexed asset, address indexed user, uint256 feeBps);
    event FeeOverrideCleared(address indexed asset, address indexed user);
    event OracleChanged(address oracle);
    event OracleToggled(bool enabled);

    // --- Fee Logic ---

    function setDefaultFeeBps(uint256 feeBps) external onlyOwner {
        require(feeBps <= 500, "Fee too high");
        defaultFeeBps = feeBps;
        emit DefaultFeeChanged(feeBps);
    }

    function setAssetFeeBps(address asset, uint256 feeBps) external onlyOwner {
        require(feeBps <= 500, "Fee too high");
        assetFeeBps[asset] = feeBps;
        emit AssetFeeChanged(asset, feeBps);
    }

    function setFeeOverride(address asset, address user, uint256 feeBps) external onlyOwner {
        require(feeBps <= 500, "Fee too high");
        feeOverrides[asset][user] = FeeOverride({exists: true, feeBps: feeBps});
        emit FeeOverrideSet(asset, user, feeBps);
    }

    function clearFeeOverride(address asset, address user) external onlyOwner {
        delete feeOverrides[asset][user];
        emit FeeOverrideCleared(asset, user);
    }

    function setFeeOracle(address oracle) external onlyOwner {
        feeOracle = IFeeOracle(oracle);
        emit OracleChanged(oracle);
    }

    function setOracleEnabled(bool enabled) external onlyOwner {
        oracleEnabled = enabled;
        emit OracleToggled(enabled);
    }

    /// @notice Returns the effective fee for a given asset and user, considering all overrides and oracle if enabled.
    function getFee(address asset, address user, bytes calldata context) external view returns (uint256 feeBps) {
        // User-specific override
        FeeOverride memory fo = feeOverrides[asset][user];
        if (fo.exists) return fo.feeBps;
        // Asset-specific override
        if (assetFeeBps[asset] > 0) return assetFeeBps[asset];
        // Oracle
        if (oracleEnabled && address(feeOracle) != address(0)) {
            try feeOracle.getFee(asset, user, context) returns (uint256 oracleFee) {
                return oracleFee;
            } catch {
                // fallback to below
            }
        }
        // Global default
        return defaultFeeBps;
    }

    // --- For protocol integration: calculate fee amount from value ---

    /// @notice Computes the fee for a given value, asset, user, and context (returns (feeAmount, effectiveFeeBps))
    function computeFee(
        address asset,
        address user,
        uint256 value,
        bytes calldata context
    ) external view returns (uint256 feeAmount, uint256 effectiveBps) {
        effectiveBps = this.getFee(asset, user, context);
        feeAmount = (value * effectiveBps) / 10000;
    }
}
