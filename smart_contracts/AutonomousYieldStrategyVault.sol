// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title AutonomousYieldStrategyVault
/// @notice Unstoppable, modular, plug-in yield strategy vault for ERC20/ETH, with auto-compounding, performance fees, emergency withdrawal, and DAO/DeFi readiness.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

interface IYieldStrategyPlugin {
    function deploy(uint256 amount) external;
    function withdraw(uint256 shares, address to) external returns (uint256 withdrawn);
    function totalAssets() external view returns (uint256);
    function harvest() external returns (uint256 profit);
}

contract AutonomousYieldStrategyVault is Ownable, ERC20Burnable {
    IERC20 public immutable asset;
    address public strategyPlugin;
    uint256 public performanceFeeBps; // Basis points, e.g., 200 = 2%
    address public feeRecipient;
    bool public emergencyMode;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event StrategySet(address indexed plugin);
    event PerformanceFeeSet(uint256 bps, address recipient);
    event Harvested(uint256 profit, uint256 fee);
    event EmergencyModeActivated();

    modifier notEmergency() {
        require(!emergencyMode, "Emergency mode");
        _;
    }

    constructor(
        address _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        require(_asset != address(0), "Asset required");
        asset = IERC20(_asset);
        performanceFeeBps = 200; // default 2%
        feeRecipient = msg.sender;
    }

    // --- Deposit/Withdraw ---

    function deposit(uint256 amount) external notEmergency returns (uint256 shares) {
        require(amount > 0, "Zero amount");
        uint256 totalAssetsBefore = totalAssets();
        asset.transferFrom(msg.sender, address(this), amount);
        _earn();
        shares = totalSupply() == 0 ? amount : (amount * totalSupply()) / totalAssetsBefore;
        _mint(msg.sender, shares);
        emit Deposited(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) external returns (uint256 amount) {
        require(shares > 0, "Zero shares");
        require(balanceOf(msg.sender) >= shares, "Not enough shares");
        _burn(msg.sender, shares);
        amount = _withdrawUnderlying(shares, msg.sender);
        emit Withdrawn(msg.sender, amount, shares);
    }

    function _earn() internal {
        if (strategyPlugin != address(0)) {
            uint256 toDeploy = asset.balanceOf(address(this));
            if (toDeploy > 0) {
                asset.approve(strategyPlugin, toDeploy);
                IYieldStrategyPlugin(strategyPlugin).deploy(toDeploy);
            }
        }
    }

    function _withdrawUnderlying(uint256 shares, address to) internal returns (uint256 withdrawn) {
        uint256 totalAssets_ = totalAssets();
        withdrawn = (shares * totalAssets_) / totalSupply();
        if (strategyPlugin != address(0)) {
            withdrawn = IYieldStrategyPlugin(strategyPlugin).withdraw(withdrawn, to);
        } else {
            asset.transfer(to, withdrawn);
        }
    }

    // --- Admin/Strategy Controls ---

    function setStrategyPlugin(address plugin) external onlyOwner notEmergency {
        require(plugin != address(0), "No plugin");
        strategyPlugin = plugin;
        emit StrategySet(plugin);
        _earn();
    }

    function setPerformanceFee(uint256 bps, address recipient) external onlyOwner {
        require(bps <= 1000, "Fee too high");
        require(recipient != address(0), "Recipient required");
        performanceFeeBps = bps;
        feeRecipient = recipient;
        emit PerformanceFeeSet(bps, recipient);
    }

    function activateEmergencyMode() external onlyOwner {
        emergencyMode = true;
        emit EmergencyModeActivated();
    }

    // --- Yield/Compound Logic ---

    function harvest() external notEmergency {
        require(strategyPlugin != address(0), "No strategy");
        uint256 profit = IYieldStrategyPlugin(strategyPlugin).harvest();
        uint256 fee = (profit * performanceFeeBps) / 10000;
        if (fee > 0 && feeRecipient != address(0)) {
            asset.transfer(feeRecipient, fee);
        }
        emit Harvested(profit, fee);
    }

    // --- View Functions ---

    function totalAssets() public view returns (uint256) {
        if (strategyPlugin != address(0)) {
            return IYieldStrategyPlugin(strategyPlugin).totalAssets();
        } else {
            return asset.balanceOf(address(this));
        }
    }

    function pricePerShare() public view returns (uint256) {
        return totalSupply() == 0 ? 1e18 : (totalAssets() * 1e18) / totalSupply();
    }

    function getStrategyPlugin() external view returns (address) {
        return strategyPlugin;
    }

    function getPerformanceFee() external view returns (uint256 bps, address recipient) {
        return (performanceFeeBps, feeRecipient);
    }
}
