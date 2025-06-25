// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title PredictionMarketEngine
/// @notice Unstoppable, modular, advanced on-chain prediction market engine (binary/categorical/scalar/tournament) with oracle and dispute integration.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IOracle {
    function getResult(bytes32 marketId) external view returns (bytes memory); // flexible for different types
    function isFinalized(bytes32 marketId) external view returns (bool);
}

contract PredictionMarketEngine is Ownable {
    enum MarketType { Binary, Categorical, Scalar }
    enum MarketStatus { Open, Resolved, Disputed, Cancelled }

    struct Market {
        address creator;
        MarketType marketType;
        string title;
        string description;
        string[] outcomes; // for categorical/binary
        int256 lowerBound; // for scalar
        int256 upperBound; // for scalar
        IERC20 collateralToken;
        uint256 collateralPerShare;
        MarketStatus status;
        address oracle;
        bytes32 result; // outcome or scalar value hash
        uint256 createdAt;
        uint256 resolvedAt;
        mapping(address => mapping(uint256 => uint256)) shares; // user => outcome => shares
        mapping(address => bool) withdrawn;
        uint256[] totalShares; // outcome => total shares
        uint256 feeBps;
    }

    uint256 public marketCount;
    mapping(bytes32 => Market) private markets;
    mapping(bytes32 => address[]) private participants;
    mapping(address => bytes32[]) public userMarkets;

    event MarketCreated(
        bytes32 indexed marketId,
        address indexed creator,
        MarketType marketType,
        string title,
        uint256 feeBps
    );
    event SharesBought(bytes32 indexed marketId, address indexed buyer, uint256 outcome, uint256 amount);
    event MarketResolved(bytes32 indexed marketId, bytes32 result, uint256 resolvedAt);
    event DisputeRaised(bytes32 indexed marketId, address indexed disputer);
    event DisputeResolved(bytes32 indexed marketId, bytes32 newResult, uint256 resolvedAt);
    event WinningsWithdrawn(bytes32 indexed marketId, address indexed user, uint256 amount);
    event MarketCancelled(bytes32 indexed marketId);

    modifier onlyMarketCreator(bytes32 marketId) {
        require(markets[marketId].creator == msg.sender, "Not creator");
        _;
    }
    modifier marketExists(bytes32 marketId) {
        require(markets[marketId].creator != address(0), "Market not exist");
        _;
    }
    modifier marketOpen(bytes32 marketId) {
        require(markets[marketId].status == MarketStatus.Open, "Not open");
        _;
    }

    // --- Market Creation ---

    function createMarket(
        MarketType marketType,
        string calldata title,
        string calldata description,
        string[] calldata outcomes,
        int256 lowerBound,
        int256 upperBound,
        address collateralToken,
        uint256 collateralPerShare,
        uint256 feeBps,
        address oracle
    ) external returns (bytes32 marketId) {
        require(collateralPerShare > 0, "No collateral");
        require(collateralToken != address(0), "No token");
        require(feeBps <= 500, "Fee too high");
        require(oracle != address(0), "No oracle");

        if (marketType == MarketType.Binary) require(outcomes.length == 2, "Binary requires 2 outcomes");
        if (marketType == MarketType.Categorical) require(outcomes.length > 2, "Categorical requires >2 outcomes");
        if (marketType == MarketType.Scalar) require(outcomes.length == 0 && upperBound > lowerBound, "Invalid scalar params");

        marketId = keccak256(abi.encodePacked(msg.sender, block.timestamp, title, description));
        Market storage m = markets[marketId];
        m.creator = msg.sender;
        m.marketType = marketType;
        m.title = title;
        m.description = description;
        for (uint256 i = 0; i < outcomes.length; i++) m.outcomes.push(outcomes[i]);
        m.lowerBound = lowerBound;
        m.upperBound = upperBound;
        m.collateralToken = IERC20(collateralToken);
        m.collateralPerShare = collateralPerShare;
        m.status = MarketStatus.Open;
        m.oracle = oracle;
        m.createdAt = block.timestamp;
        m.feeBps = feeBps;
        m.totalShares = new uint256[](outcomes.length > 0 ? outcomes.length : 1);

        emit MarketCreated(marketId, msg.sender, marketType, title, feeBps);
    }

    // --- Participating (Buy Shares) ---

    function buyShares(bytes32 marketId, uint256 outcome, uint256 amount) external marketExists(marketId) marketOpen(marketId) {
        Market storage m = markets[marketId];
        require(amount > 0, "Zero amount");
        require(outcome < (m.outcomes.length > 0 ? m.outcomes.length : 1), "Invalid outcome");

        uint256 totalCost = amount * m.collateralPerShare;
        require(m.collateralToken.transferFrom(msg.sender, address(this), totalCost), "Collateral transfer failed");

        if (m.shares[msg.sender][outcome] == 0) participants[marketId].push(msg.sender);
        m.shares[msg.sender][outcome] += amount;
        m.totalShares[outcome] += amount;
        userMarkets[msg.sender].push(marketId);

        emit SharesBought(marketId, msg.sender, outcome, amount);
    }

    // --- Market Resolution (Oracle/Dispute) ---

    function resolveMarket(bytes32 marketId) external marketExists(marketId) marketOpen(marketId) {
        Market storage m = markets[marketId];
        IOracle oracle = IOracle(m.oracle);
        require(oracle.isFinalized(marketId), "Result not finalized");
        bytes memory result = oracle.getResult(marketId);

        if (m.marketType == MarketType.Scalar) {
            require(result.length == 32, "Scalar: 32 bytes (int256)");
            m.result = bytes32(result);
        } else {
            // For binary/categorical: result is index (uint256) encoded as bytes32
            require(result.length == 32, "Result: 32 bytes (uint256)");
            m.result = bytes32(result);
        }
        m.status = MarketStatus.Resolved;
        m.resolvedAt = block.timestamp;
        emit MarketResolved(marketId, m.result, m.resolvedAt);
    }

    function raiseDispute(bytes32 marketId) external marketExists(marketId) {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Resolved, "Not resolved");
        m.status = MarketStatus.Disputed;
        emit DisputeRaised(marketId, msg.sender);
    }

    function resolveDispute(bytes32 marketId, bytes calldata newResult) external onlyOwner marketExists(marketId) {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Disputed, "Not disputed");
        m.result = bytes32(newResult);
        m.status = MarketStatus.Resolved;
        m.resolvedAt = block.timestamp;
        emit DisputeResolved(marketId, m.result, m.resolvedAt);
    }

    // --- Withdraw winnings ---

    function withdrawWinnings(bytes32 marketId) external marketExists(marketId) {
        Market storage m = markets[marketId];
        require(m.status == MarketStatus.Resolved, "Not resolved");
        require(!m.withdrawn[msg.sender], "Already withdrawn");
        uint256 payout = 0;
        uint256 userShare = 0;
        uint256 totalWinningShares = 0;
        uint256 outcomeIdx = 0;

        if (m.marketType == MarketType.Scalar) {
            // For scalar, closest guess or custom payout logic can be added here
            int256 result = int256(uint256(m.result));
            // For simplicity, treat as a winner if their pick equals result (can be extended)
            for (uint256 i = 0; i < m.totalShares.length; i++) {
                if (int256(i) == result) {
                    totalWinningShares = m.totalShares[i];
                    userShare = m.shares[msg.sender][i];
                    outcomeIdx = i;
                    break;
                }
            }
        } else {
            outcomeIdx = uint256(m.result);
            totalWinningShares = m.totalShares[outcomeIdx];
            userShare = m.shares[msg.sender][outcomeIdx];
        }

        require(userShare > 0, "No winning shares");
        uint256 totalPot = m.collateralPerShare * totalSharesSum(m.totalShares);
        uint256 fee = (totalPot * m.feeBps) / 10000;
        uint256 distributable = totalPot - fee;
        payout = (distributable * userShare) / totalWinningShares;

        m.withdrawn[msg.sender] = true;
        require(m.collateralToken.transfer(msg.sender, payout), "Winnings transfer failed");
        emit WinningsWithdrawn(marketId, msg.sender, payout);
    }

    function totalSharesSum(uint256[] memory arr) internal pure returns (uint256 sum) {
        for (uint256 i = 0; i < arr.length; i++) sum += arr[i];
    }

    // --- Market Cancellation ---

    function cancelMarket(bytes32 marketId) external onlyMarketCreator(marketId) marketExists(marketId) marketOpen(marketId) {
        Market storage m = markets[marketId];
        m.status = MarketStatus.Cancelled;
        // Refund all participants
        for (uint256 i = 0; i < participants[marketId].length; i++) {
            address user = participants[marketId][i];
            for (uint256 o = 0; o < m.totalShares.length; o++) {
                uint256 shares = m.shares[user][o];
                if (shares > 0) {
                    m.shares[user][o] = 0;
                    uint256 refund = shares * m.collateralPerShare;
                    m.collateralToken.transfer(user, refund);
                }
            }
        }
        emit MarketCancelled(marketId);
    }

    // --- View functions ---

    function getMarket(bytes32 marketId) external view marketExists(marketId) returns (
        address creator,
        MarketType marketType,
        string memory title,
        string memory description,
        string[] memory outcomes,
        int256 lowerBound,
        int256 upperBound,
        address collateralToken,
        uint256 collateralPerShare,
        MarketStatus status,
        address oracle,
        bytes32 result,
        uint256 createdAt,
        uint256 resolvedAt,
        uint256[] memory totalShares,
        uint256 feeBps
    ) {
        Market storage m = markets[marketId];
        return (
            m.creator,
            m.marketType,
            m.title,
            m.description,
            m.outcomes,
            m.lowerBound,
            m.upperBound,
            address(m.collateralToken),
            m.collateralPerShare,
            m.status,
            m.oracle,
            m.result,
            m.createdAt,
            m.resolvedAt,
            m.totalShares,
            m.feeBps
        );
    }

    function getUserShares(bytes32 marketId, address user) external view marketExists(marketId) returns (uint256[] memory) {
        Market storage m = markets[marketId];
        uint256[] memory shares = new uint256[](m.totalShares.length);
        for (uint256 i = 0; i < shares.length; i++) {
            shares[i] = m.shares[user][i];
        }
        return shares;
    }

    function getParticipants(bytes32 marketId) external view marketExists(marketId) returns (address[] memory) {
        return participants[marketId];
    }
}
