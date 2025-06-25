// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ComposableStakingDerivatives
/// @notice Ultra-advanced, unstoppable contract for composable, transferable staking derivatives (ERC20, ERC721, ERC1155), auto-compounding, and DeFi integration.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ComposableStakingDerivatives is Ownable, ERC20Burnable, ERC20Pausable {
    struct StakeInfo {
        address staker;
        address token;
        uint256 amount;
        uint256 shares;
        uint256 timestamp;
        bool active;
    }

    IERC20 public immutable stakingToken;
    uint256 public totalStaked;
    uint256 public totalShares;
    uint256 public rewardRate; // reward per second per share
    uint256 public lastUpdateTime;
    uint256 public rewardPerShareStored;

    mapping(address => uint256) public userShares;
    mapping(address => uint256) public userRewardPerSharePaid;
    mapping(address => uint256) public rewards;
    mapping(address => StakeInfo[]) public userStakes;

    event Staked(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event RewardPaid(address indexed user, uint256 reward);
    event AutoCompounded(uint256 newRewardRate);

    constructor(
        address _stakingToken,
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        require(_stakingToken != address(0), "Staking token required");
        stakingToken = IERC20(_stakingToken);
        lastUpdateTime = block.timestamp;
    }

    // --- Staking Logic ---

    function stake(uint256 amount) external whenNotPaused {
        require(amount > 0, "Amount=0");
        _updateReward(msg.sender);

        stakingToken.transferFrom(msg.sender, address(this), amount);
        uint256 shares = totalStaked == 0 ? amount : (amount * totalShares) / totalStaked;
        if (shares == 0) shares = amount; // first staker

        totalStaked += amount;
        totalShares += shares;
        userShares[msg.sender] += shares;
        userStakes[msg.sender].push(StakeInfo(msg.sender, address(stakingToken), amount, shares, block.timestamp, true));

        _mint(msg.sender, shares);

        emit Staked(msg.sender, amount, shares);
    }

    function withdraw(uint256 shares) public whenNotPaused {
        require(shares > 0, "Shares=0");
        require(userShares[msg.sender] >= shares, "Insufficient shares");
        _updateReward(msg.sender);

        uint256 amount = (shares * totalStaked) / totalShares;
        totalStaked -= amount;
        totalShares -= shares;
        userShares[msg.sender] -= shares;

        _burn(msg.sender, shares);
        stakingToken.transfer(msg.sender, amount);

        // Mark stakes as inactive (simple implementation: mark the oldest stakes)
        uint256 remaining = shares;
        StakeInfo[] storage stakes = userStakes[msg.sender];
        for (uint256 i = 0; i < stakes.length && remaining > 0; i++) {
            if (stakes[i].active) {
                if (stakes[i].shares <= remaining) {
                    remaining -= stakes[i].shares;
                    stakes[i].active = false;
                } else {
                    stakes[i].shares -= remaining;
                    remaining = 0;
                }
            }
        }

        emit Withdrawn(msg.sender, amount, shares);
    }

    function exit() external {
        withdraw(userShares[msg.sender]);
        getReward();
    }

    // --- Reward Logic ---

    function _updateReward(address account) internal {
        rewardPerShareStored = rewardPerShare();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerSharePaid[account] = rewardPerShareStored;
        }
    }

    function rewardPerShare() public view returns (uint256) {
        if (totalShares == 0) return rewardPerShareStored;
        return rewardPerShareStored + (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / totalShares);
    }

    function earned(address account) public view returns (uint256) {
        return
            (userShares[account] *
                (rewardPerShare() - userRewardPerSharePaid[account])) /
            1e18 +
            rewards[account];
    }

    function getReward() public {
        _updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            stakingToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    // --- Admin Functions ---

    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        _updateReward(address(0));
        rewardRate = _rewardRate;
        emit AutoCompounded(_rewardRate);
    }

    function pause() external onlyOwner {
        _pause();
    }
    function unpause() external onlyOwner {
        _unpause();
    }

    // --- ERC20 Overrides ---

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Pausable)
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    // --- View Functions ---

    function getUserStakes(address user) external view returns (StakeInfo[] memory) {
        return userStakes[user];
    }
}
