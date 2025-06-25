// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title AutonomousMarketMakerV4
/// @notice AI-optimized, impermanent-loss-protected, permissionless AMM with modular pool logic.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IFeeOptimizer {
    function getDynamicFee(address pool, uint256 volume, uint256 volatility) external view returns (uint256);
}

interface IILProtection {
    function insure(
        address user, 
        address tokenA, 
        address tokenB, 
        uint256 amountA, 
        uint256 amountB,
        uint256 timestamp
    ) external returns (uint256 policyId);
    function claim(uint256 policyId, address user) external;
}

contract AutonomousMarketMakerV4 is Ownable {
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalShares;
        mapping(address => uint256) shares;
        uint256 lastVolume;
        uint256 lastVolatility;
        address creator;
        bool active;
        uint256 insurancePolicyId;
    }

    // Pool id => Pool
    mapping(bytes32 => Pool) private pools;
    bytes32[] public poolIds;

    IFeeOptimizer public feeOptimizer;
    IILProtection public ilProtection;
    uint256 public defaultFeeBps; // e.g., 30 = 0.3%

    event PoolCreated(bytes32 indexed poolId, address indexed creator, address tokenA, address tokenB);
    event LiquidityAdded(bytes32 indexed poolId, address indexed user, uint256 amountA, uint256 amountB, uint256 sharesMinted);
    event LiquidityRemoved(bytes32 indexed poolId, address indexed user, uint256 sharesBurned, uint256 amountA, uint256 amountB);
    event Swapped(bytes32 indexed poolId, address indexed user, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut, uint256 fee);
    event FeeOptimizerSet(address indexed optimizer);
    event ILProtectionSet(address indexed ilProtection);
    event ILProtectionPolicyCreated(bytes32 indexed poolId, uint256 policyId);

    // --- Modifiers ---

    modifier validPool(bytes32 poolId) {
        require(pools[poolId].active, "Invalid pool");
        _;
    }

    // --- Pool Creation ---

    function createPool(address tokenA, address tokenB) external returns (bytes32 poolId) {
        require(tokenA != tokenB, "Tokens must differ");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        poolId = keccak256(abi.encodePacked(tokenA, tokenB, block.timestamp, msg.sender));
        require(!pools[poolId].active, "Pool exists");
        Pool storage pool = pools[poolId];
        pool.tokenA = tokenA;
        pool.tokenB = tokenB;
        pool.creator = msg.sender;
        pool.active = true;
        poolIds.push(poolId);
        emit PoolCreated(poolId, msg.sender, tokenA, tokenB);
    }

    // --- Liquidity Management ---

    function addLiquidity(bytes32 poolId, uint256 amountA, uint256 amountB) external validPool(poolId) returns (uint256 sharesMinted) {
        Pool storage pool = pools[poolId];
        IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountB);

        if (pool.totalShares == 0) {
            sharesMinted = sqrt(amountA * amountB);
        } else {
            sharesMinted = min(
                (amountA * pool.totalShares) / pool.reserveA,
                (amountB * pool.totalShares) / pool.reserveB
            );
        }
        require(sharesMinted > 0, "Zero shares");
        pool.shares[msg.sender] += sharesMinted;
        pool.totalShares += sharesMinted;
        pool.reserveA += amountA;
        pool.reserveB += amountB;

        // Optional: Insure liquidity
        if (address(ilProtection) != address(0)) {
            uint256 policyId = ilProtection.insure(msg.sender, pool.tokenA, pool.tokenB, amountA, amountB, block.timestamp);
            pool.insurancePolicyId = policyId;
            emit ILProtectionPolicyCreated(poolId, policyId);
        }

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, sharesMinted);
    }

    function removeLiquidity(bytes32 poolId, uint256 shares) external validPool(poolId) returns (uint256 amountA, uint256 amountB) {
        Pool storage pool = pools[poolId];
        require(pool.shares[msg.sender] >= shares, "Not enough shares");
        uint256 totalShares = pool.totalShares;
        amountA = (pool.reserveA * shares) / totalShares;
        amountB = (pool.reserveB * shares) / totalShares;

        pool.shares[msg.sender] -= shares;
        pool.totalShares -= shares;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        IERC20(pool.tokenA).transfer(msg.sender, amountA);
        IERC20(pool.tokenB).transfer(msg.sender, amountB);

        // Optional: Claim IL protection if needed
        if (address(ilProtection) != address(0) && pool.insurancePolicyId != 0) {
            ilProtection.claim(pool.insurancePolicyId, msg.sender);
        }

        emit LiquidityRemoved(poolId, msg.sender, shares, amountA, amountB);
    }

    // --- Swapping ---

    function swap(bytes32 poolId, address tokenIn, uint256 amountIn) external validPool(poolId) returns (uint256 amountOut, uint256 fee) {
        Pool storage pool = pools[poolId];
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");
        address tokenOut = tokenIn == pool.tokenA ? pool.tokenB : pool.tokenA;

        // Calculate dynamic fee
        fee = defaultFeeBps;
        if (address(feeOptimizer) != address(0)) {
            fee = feeOptimizer.getDynamicFee(poolId, pool.lastVolume, pool.lastVolatility);
        }

        uint256 feeAmount = (amountIn * fee) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        // Standard constant product AMM (Uniswap V2)
        if (tokenIn == pool.tokenA) {
            amountOut = getAmountOut(amountInAfterFee, pool.reserveA, pool.reserveB);
            pool.reserveA += amountInAfterFee;
            pool.reserveB -= amountOut;
        } else {
            amountOut = getAmountOut(amountInAfterFee, pool.reserveB, pool.reserveA);
            pool.reserveB += amountInAfterFee;
            pool.reserveA -= amountOut;
        }

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);

        // Update stats
        pool.lastVolume = amountIn;
        // For simplicity, volatility is not computed here. In production, integrate with external data.

        emit Swapped(poolId, msg.sender, tokenIn, amountIn, tokenOut, amountOut, fee);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(reserveIn > 0 && reserveOut > 0, "Empty reserves");
        uint256 amountInWithFee = amountIn;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn + amountInWithFee;
        return numerator / denominator;
    }

    // --- Admin/Optimization ---

    function setFeeOptimizer(address optimizer) external onlyOwner {
        feeOptimizer = IFeeOptimizer(optimizer);
        emit FeeOptimizerSet(optimizer);
    }

    function setILProtection(address protection) external onlyOwner {
        ilProtection = IILProtection(protection);
        emit ILProtectionSet(protection);
    }

    function setDefaultFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Fee too high"); // Max 5%
        defaultFeeBps = newFeeBps;
    }

    // --- View Functions ---

    function getPool(bytes32 poolId) external view returns (
        address tokenA,
        address tokenB,
        uint256 reserveA,
        uint256 reserveB,
        uint256 totalShares,
        address creator,
        bool active
    ) {
        Pool storage pool = pools[poolId];
        return (pool.tokenA, pool.tokenB, pool.reserveA, pool.reserveB, pool.totalShares, pool.creator, pool.active);
    }

    function getUserShares(bytes32 poolId, address user) external view returns (uint256) {
        return pools[poolId].shares[user];
    }

    function numPools() external view returns (uint256) {
        return poolIds.length;
    }

    // --- Math Utilities ---

    function sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 a, uint256 b) private pure returns (uint256) {
        return a < b ? a : b;
    }
}
