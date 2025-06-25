// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UnstoppableInsurancePool
/// @notice Autonomous, self-adjusting, unstoppable insurance protocol with parametric triggers, dynamic risk pricing, and DAO governance.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IOracle {
    function validateClaim(bytes32 policyId, bytes calldata claimData) external view returns (bool valid, uint256 payout);
}

interface IGovernance {
    function canManagePool(address user) external view returns (bool);
    function canSetParameters(address user) external view returns (bool);
}

contract UnstoppableInsurancePool {
    struct Policy {
        address owner;
        uint256 premium;
        uint256 coverAmount;
        uint256 start;
        uint256 end;
        bytes32 trigger; // e.g., "FLOOD", "HACK", "WEATHER"
        bool active;
    }

    address public governance;
    IOracle public oracle;
    uint256 public totalPremiums;
    uint256 public totalPayouts;
    uint256 public poolReserves;
    uint256 public basePremiumRate; // e.g. 100 = 1%
    uint256 public riskMultiplier; // e.g. 150 = 1.5x

    mapping(bytes32 => Policy) public policies;
    mapping(address => bytes32[]) public userPolicies;

    event PolicyPurchased(bytes32 indexed policyId, address indexed user, uint256 premium, uint256 coverAmount, bytes32 trigger, uint256 start, uint256 end);
    event ClaimSubmitted(bytes32 indexed policyId, address indexed user, bytes claimData);
    event ClaimValidated(bytes32 indexed policyId, address indexed user, uint256 payout);
    event PremiumRateChanged(uint256 newRate);
    event RiskMultiplierChanged(uint256 newMultiplier);
    event OracleChanged(address newOracle);
    event GovernanceChanged(address newGov);
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    modifier onlyGovernance() {
        require(IGovernance(governance).canManagePool(msg.sender), "Not authorized");
        _;
    }

    constructor(address _governance, address _oracle, uint256 _premiumRate, uint256 _riskMultiplier) {
        require(_governance != address(0), "Invalid gov");
        require(_oracle != address(0), "Invalid oracle");
        governance = _governance;
        oracle = IOracle(_oracle);
        basePremiumRate = _premiumRate;
        riskMultiplier = _riskMultiplier;
    }

    // --- Pool Funding ---
    function depositFunds() external payable {
        require(msg.value > 0, "Zero deposit");
        poolReserves += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }

    function withdrawFunds(address to, uint256 amount) external onlyGovernance {
        require(poolReserves >= amount, "Insufficient reserves");
        poolReserves -= amount;
        payable(to).transfer(amount);
        emit FundsWithdrawn(to, amount);
    }

    // --- Policy Management ---
    function purchasePolicy(uint256 coverAmount, uint256 duration, bytes32 trigger) external payable returns (bytes32 policyId) {
        require(coverAmount > 0 && duration > 0, "Invalid params");
        require(poolReserves >= coverAmount, "Not enough reserves");

        uint256 premium = computePremium(coverAmount, duration, trigger);
        require(msg.value >= premium, "Insufficient premium");

        policyId = keccak256(abi.encodePacked(msg.sender, block.timestamp, coverAmount, duration, trigger));
        policies[policyId] = Policy({
            owner: msg.sender,
            premium: premium,
            coverAmount: coverAmount,
            start: block.timestamp,
            end: block.timestamp + duration,
            trigger: trigger,
            active: true
        });
        userPolicies[msg.sender].push(policyId);

        totalPremiums += premium;
        poolReserves += premium;
        // Refund any excess
        if (msg.value > premium) {
            payable(msg.sender).transfer(msg.value - premium);
        }

        emit PolicyPurchased(policyId, msg.sender, premium, coverAmount, trigger, block.timestamp, block.timestamp + duration);
    }

    function computePremium(uint256 coverAmount, uint256 duration, bytes32 /*trigger*/) public view returns (uint256) {
        // Simple premium calculation: premium = cover * baseRate * riskMultiplier * duration (per 365 days)
        uint256 annualPremium = (coverAmount * basePremiumRate * riskMultiplier) / (10000 * 100);
        uint256 premium = (annualPremium * duration) / 365 days;
        return premium;
    }

    // --- Claims ---

    function submitClaim(bytes32 policyId, bytes calldata claimData) external {
        Policy storage policy = policies[policyId];
        require(policy.owner == msg.sender, "Not policy owner");
        require(policy.active, "Policy inactive");
        require(block.timestamp >= policy.start && block.timestamp <= policy.end, "Policy not active");
        emit ClaimSubmitted(policyId, msg.sender, claimData);

        (bool valid, uint256 payout) = oracle.validateClaim(policyId, claimData);
        if (valid && payout > 0 && payout <= policy.coverAmount && poolReserves >= payout) {
            policy.active = false;
            totalPayouts += payout;
            poolReserves -= payout;
            payable(policy.owner).transfer(payout);
            emit ClaimValidated(policyId, msg.sender, payout);
        }
    }

    // --- DAO and Governance Management ---

    function setPremiumRate(uint256 newRate) external onlyGovernance {
        require(newRate > 0, "Zero rate");
        basePremiumRate = newRate;
        emit PremiumRateChanged(newRate);
    }

    function setRiskMultiplier(uint256 newMultiplier) external onlyGovernance {
        require(newMultiplier > 0, "Zero multiplier");
        riskMultiplier = newMultiplier;
        emit RiskMultiplierChanged(newMultiplier);
    }

    function setOracle(address newOracle) external onlyGovernance {
        require(newOracle != address(0), "Invalid oracle");
        oracle = IOracle(newOracle);
        emit OracleChanged(newOracle);
    }

    function setGovernance(address newGov) external onlyGovernance {
        require(newGov != address(0), "Invalid gov");
        governance = newGov;
        emit GovernanceChanged(newGov);
    }

    // --- View functions ---

    function getUserPolicies(address user) external view returns (bytes32[] memory) {
        return userPolicies[user];
    }

    function getPolicy(bytes32 policyId) external view returns (Policy memory) {
        return policies[policyId];
    }

    function getPoolStats() external view returns (
        uint256 _totalPremiums,
        uint256 _totalPayouts,
        uint256 _poolReserves,
        uint256 _basePremiumRate,
        uint256 _riskMultiplier
    ) {
        return (totalPremiums, totalPayouts, poolReserves, basePremiumRate, riskMultiplier);
    }

    receive() external payable {
        poolReserves += msg.value;
        emit FundsDeposited(msg.sender, msg.value);
    }
}
