// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ProgrammableYieldVault
/// @notice Feature-rich, composable ERC-4626 compatible yield vault with programmable strategies, auto-rebalancing, and risk controls.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IYieldStrategy {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function harvest() external returns (uint256 yield);
    function balance() external view returns (uint256);
    function name() external view returns (string memory);
    function riskScore() external view returns (uint8); // 1 (low) - 10 (high)
}

contract ProgrammableYieldVault is ERC4626, Ownable {
    struct StrategyConfig {
        address strategy;
        uint256 allocationBps; // in basis points, e.g. 5000 = 50%
        bool enabled;
    }

    StrategyConfig[] public strategies;
    mapping(address => uint256) public strategyIndex; // strategy address => index+1

    uint256 public constant MAX_BPS = 10000;
    uint256 public autoCompoundInterval; // seconds
    uint256 public lastCompoundTime;
    uint256 public riskTolerance; // 1-10

    event StrategyAdded(address indexed strategy, uint256 allocationBps);
    event StrategyUpdated(address indexed strategy, uint256 allocationBps, bool enabled);
    event StrategyRemoved(address indexed strategy);
    event AutoCompound();
    event RiskToleranceChanged(uint256 newScore);

    modifier onlyStrategy() {
        require(strategyIndex[msg.sender] > 0, "Not a strategy");
        _;
    }

    constructor(
        IERC20 asset_,
        string memory name_,
        string memory symbol_,
        uint256 _riskTolerance,
        uint256 _compoundInterval
    ) ERC4626(asset_) ERC20(name_, symbol_) {
        riskTolerance = _riskTolerance;
        autoCompoundInterval = _compoundInterval;
        lastCompoundTime = block.timestamp;
    }

    // --- Strategy Management ---

    function addStrategy(address strategy, uint256 allocationBps) external onlyOwner {
        require(strategy != address(0), "Invalid strategy");
        require(strategyIndex[strategy] == 0, "Already added");
        require(allocationBps > 0 && allocationBps <= MAX_BPS, "Invalid allocation");
        require(_totalAlloc() + allocationBps <= MAX_BPS, "Exceeds allocation");
        require(IYieldStrategy(strategy).riskScore() <= riskTolerance, "Too risky");

        strategies.push(StrategyConfig(strategy, allocationBps, true));
        strategyIndex[strategy] = strategies.length;
        emit StrategyAdded(strategy, allocationBps);
    }

    function updateStrategy(address strategy, uint256 allocationBps, bool enabled) external onlyOwner {
        uint256 idx = strategyIndex[strategy];
        require(idx > 0, "Not found");
        require(allocationBps <= MAX_BPS, "Invalid allocation");
        if (allocationBps > 0) {
            strategies[idx - 1].allocationBps = allocationBps;
        }
        strategies[idx - 1].enabled = enabled;
        require(_totalAlloc() <= MAX_BPS, "Exceeds allocation");
        emit StrategyUpdated(strategy, allocationBps, enabled);
    }

    function removeStrategy(address strategy) external onlyOwner {
        uint256 idx = strategyIndex[strategy];
        require(idx > 0, "Not found");
        uint256 last = strategies.length - 1;
        if (idx - 1 != last) {
            strategies[idx - 1] = strategies[last];
            strategyIndex[strategies[last].strategy] = idx;
        }
        strategies.pop();
        delete strategyIndex[strategy];
        emit StrategyRemoved(strategy);
    }

    function setRiskTolerance(uint256 newScore) external onlyOwner {
        require(newScore > 0 && newScore <= 10, "Out of range");
        riskTolerance = newScore;
        emit RiskToleranceChanged(newScore);
    }

    // --- Vault Logic (ERC-4626) ---

    /// @inheritdoc ERC4626
    function totalAssets() public view override returns (uint256) {
        uint256 bal = asset().balanceOf(address(this));
        for (uint256 i = 0; i < strategies.length; ++i) {
            if (strategies[i].enabled) {
                bal += IYieldStrategy(strategies[i].strategy).balance();
            }
        }
        return bal;
    }

    /// @inheritdoc ERC4626
    function beforeWithdraw(uint256 assets, uint256 /*shares*/, address /*receiver*/, address /*owner*/) internal override {
        _rebalanceWithdraw(assets);
    }

    /// @inheritdoc ERC4626
    function afterDeposit(uint256 /*assets*/, uint256 /*shares*/, address /*receiver*/) internal override {
        _rebalanceDeposit();
    }

    // --- Yield Harvesting & Auto-Compounding ---

    function autoCompound() public {
        require(block.timestamp >= lastCompoundTime + autoCompoundInterval, "Too early");
        for (uint256 i = 0; i < strategies.length; ++i) {
            if (strategies[i].enabled) {
                IYieldStrategy(strategies[i].strategy).harvest();
            }
        }
        lastCompoundTime = block.timestamp;
        _rebalanceDeposit();
        emit AutoCompound();
    }

    function setAutoCompoundInterval(uint256 interval) external onlyOwner {
        require(interval >= 1 hours && interval <= 7 days, "Unreasonable interval");
        autoCompoundInterval = interval;
    }

    // --- Internal Allocation Logic ---

    function _rebalanceDeposit() internal {
        uint256 available = asset().balanceOf(address(this));
        if (available == 0) return;
        uint256 total = totalAssets();
        for (uint256 i = 0; i < strategies.length; ++i) {
            if (!strategies[i].enabled) continue;
            uint256 ideal = (total * strategies[i].allocationBps) / MAX_BPS;
            uint256 current = IYieldStrategy(strategies[i].strategy).balance();
            if (current < ideal) {
                uint256 toDeposit = ideal - current;
                if (toDeposit > available) toDeposit = available;
                asset().approve(strategies[i].strategy, toDeposit);
                IYieldStrategy(strategies[i].strategy).deposit(toDeposit);
                available -= toDeposit;
                if (available == 0) break;
            }
        }
    }

    function _rebalanceWithdraw(uint256 needed) internal {
        uint256 have = asset().balanceOf(address(this));
        if (have >= needed) return;
        uint256 toWithdraw = needed - have;
        for (uint256 i = 0; i < strategies.length; ++i) {
            if (!strategies[i].enabled) continue;
            uint256 stratBal = IYieldStrategy(strategies[i].strategy).balance();
            uint256 take = stratBal < toWithdraw ? stratBal : toWithdraw;
            if (take > 0) {
                IYieldStrategy(strategies[i].strategy).withdraw(take);
                toWithdraw -= take;
                if (toWithdraw == 0) break;
            }
        }
    }

    function _totalAlloc() internal view returns (uint256 sum) {
        for (uint256 i = 0; i < strategies.length; ++i) {
            if (strategies[i].enabled) sum += strategies[i].allocationBps;
        }
    }

    // --- Emergency Admin Functions ---

    function emergencyWithdrawFromStrategy(address strategy, uint256 amount) external onlyOwner {
        require(strategyIndex[strategy] > 0, "Not a strategy");
        IYieldStrategy(strategy).withdraw(amount);
    }

    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(asset()), "Not vault asset");
        IERC20(token).transfer(to, amount);
    }

    // --- View Helpers ---

    function strategiesLength() external view returns (uint256) {
        return strategies.length;
    }

    function getStrategy(uint256 idx) external view returns (StrategyConfig memory) {
        return strategies[idx];
    }

    function previewStrategyBalance(address strategy) external view returns (uint256) {
        return IYieldStrategy(strategy).balance();
    }
}
