// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title SelfHealingDAO
/// @notice Autonomous DAO with self-healing, anomaly detection, circuit breakers, and threat mitigation.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IVotingToken {
    function getVotes(address account) external view returns (uint256);
}

contract SelfHealingDAO {
    enum ProposalState { Pending, Active, Succeeded, Defeated, Executed, Cancelled, Flagged, Recovered }
    enum ThreatLevel { Safe, Warning, Critical }

    struct Proposal {
        address proposer;
        string description;
        bytes callData;
        address target;
        uint256 value;
        uint256 startBlock;
        uint256 endBlock;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        ProposalState state;
        ThreatLevel threat;
        uint256 anomalyScore;
        bool circuitBroken;
        bool rolledBack;
    }

    IVotingToken public votingToken;
    address public guardian; // Emergency override
    uint256 public votingPeriod; // in blocks
    uint256 public proposalCount;
    uint256 public circuitBreakerDuration; // in blocks
    uint256 public lastBreakerBlock;
    uint256 public anomalyThreshold; // e.g., 100 = high risk

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => bytes) public rollbackCallData; // for rollback

    event ProposalCreated(uint256 indexed id, address indexed proposer, string desc);
    event VoteCast(uint256 indexed id, address indexed voter, uint8 support, uint256 weight);
    event ProposalFlagged(uint256 indexed id, uint256 anomalyScore, ThreatLevel level);
    event CircuitBreakerActivated(uint256 indexed id, address by);
    event ProposalExecuted(uint256 indexed id);
    event ProposalRolledBack(uint256 indexed id, address by);
    event GuardianChanged(address indexed newGuardian);

    modifier onlyGuardian() {
        require(msg.sender == guardian, "Not guardian");
        _;
    }

    modifier breakerInactive() {
        require(block.number > lastBreakerBlock + circuitBreakerDuration, "Circuit breaker active");
        _;
    }

    constructor(address _votingToken, address _guardian, uint256 _votingPeriod, uint256 _breakerDuration, uint256 _anomalyThreshold) {
        votingToken = IVotingToken(_votingToken);
        guardian = _guardian;
        votingPeriod = _votingPeriod;
        circuitBreakerDuration = _breakerDuration;
        anomalyThreshold = _anomalyThreshold;
    }

    // --- Proposal Lifecycle ---

    function propose(address target, uint256 value, bytes calldata callData, string calldata desc) external breakerInactive returns (uint256) {
        proposalCount += 1;
        Proposal storage p = proposals[proposalCount];
        p.proposer = msg.sender;
        p.target = target;
        p.value = value;
        p.callData = callData;
        p.description = desc;
        p.startBlock = block.number;
        p.endBlock = block.number + votingPeriod;
        p.state = ProposalState.Active;

        // Anomaly detection and threat scoring
        (p.anomalyScore, p.threat) = _analyzeThreat(target, value, callData);

        if (p.threat == ThreatLevel.Critical) {
            p.state = ProposalState.Flagged;
            emit ProposalFlagged(proposalCount, p.anomalyScore, p.threat);
            _activateCircuitBreaker(proposalCount);
        } else if (p.threat == ThreatLevel.Warning) {
            emit ProposalFlagged(proposalCount, p.anomalyScore, p.threat);
        }

        emit ProposalCreated(proposalCount, msg.sender, desc);
        return proposalCount;
    }

    function vote(uint256 proposalId, uint8 support) external breakerInactive {
        require(proposals[proposalId].state == ProposalState.Active, "Not active");
        require(block.number >= proposals[proposalId].startBlock, "Voting not started");
        require(block.number <= proposals[proposalId].endBlock, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = votingToken.getVotes(msg.sender);
        require(weight > 0, "No votes");

        if (support == 1) {
            proposals[proposalId].forVotes += weight;
        } else if (support == 2) {
            proposals[proposalId].abstainVotes += weight;
        } else {
            proposals[proposalId].againstVotes += weight;
        }

        hasVoted[proposalId][msg.sender] = true;
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function execute(uint256 proposalId) external breakerInactive {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active, "Not executable");
        require(block.number > p.endBlock, "Voting not ended");
        require(!p.circuitBroken, "Breaker active");
        require(!p.rolledBack, "Rolled back");

        if (p.forVotes > p.againstVotes) {
            (bool success, ) = p.target.call{value: p.value}(p.callData);
            require(success, "Execution failed");
            p.state = ProposalState.Executed;
            rollbackCallData[proposalId] = p.callData; // Save for rollback
            emit ProposalExecuted(proposalId);
        } else {
            p.state = ProposalState.Defeated;
        }
    }

    // --- Threat Scoring & Circuit Breaker ---

    function _analyzeThreat(address target, uint256 value, bytes calldata callData) internal view returns (uint256 score, ThreatLevel level) {
        // Example scoring: (add more logic for real-world use)
        score = 0;
        if (value > 100 ether) score += 30;
        if (target == address(0)) score += 50;
        if (callData.length > 256) score += 20;
        // Custom logic: detect critical function signatures
        bytes4 sig;
        if (callData.length >= 4) {
            sig = bytes4(callData[0]) | (bytes4(callData[1]) >> 8) | (bytes4(callData[2]) >> 16) | (bytes4(callData[3]) >> 24);
            if (sig == bytes4(keccak256("transferOwnership(address)"))) score += 50;
        }
        if (score >= anomalyThreshold) {
            level = ThreatLevel.Critical;
        } else if (score > anomalyThreshold / 2) {
            level = ThreatLevel.Warning;
        } else {
            level = ThreatLevel.Safe;
        }
    }

    function _activateCircuitBreaker(uint256 proposalId) internal {
        proposals[proposalId].circuitBroken = true;
        lastBreakerBlock = block.number;
        emit CircuitBreakerActivated(proposalId, msg.sender);
    }

    function manualFlag(uint256 proposalId, uint256 customScore, ThreatLevel customLevel) external onlyGuardian {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Active, "Not active");
        p.anomalyScore = customScore;
        p.threat = customLevel;
        if (customLevel == ThreatLevel.Critical) {
            p.state = ProposalState.Flagged;
            _activateCircuitBreaker(proposalId);
        }
        emit ProposalFlagged(proposalId, customScore, customLevel);
    }

    // --- Rollback & Recovery ---

    function rollback(uint256 proposalId) external onlyGuardian {
        Proposal storage p = proposals[proposalId];
        require(p.state == ProposalState.Executed, "Not executed");
        require(!p.rolledBack, "Already rolled back");
        // In practice, this should call a reverse function or restore previous state.
        // Here, we just record the rollback.
        p.rolledBack = true;
        p.state = ProposalState.Recovered;
        emit ProposalRolledBack(proposalId, msg.sender);
    }

    // --- Administration ---

    function changeGuardian(address newGuardian) external onlyGuardian {
        require(newGuardian != address(0), "Invalid guardian");
        guardian = newGuardian;
        emit GuardianChanged(newGuardian);
    }

    function setVotingPeriod(uint256 period) external onlyGuardian {
        require(period > 0, "Zero voting period");
        votingPeriod = period;
    }

    function setBreakerDuration(uint256 duration) external onlyGuardian {
        circuitBreakerDuration = duration;
    }

    function setAnomalyThreshold(uint256 threshold) external onlyGuardian {
        anomalyThreshold = threshold;
    }

    // --- View Helpers ---

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function proposalState(uint256 proposalId) external view returns (ProposalState) {
        return proposals[proposalId].state;
    }

    function proposalThreat(uint256 proposalId) external view returns (ThreatLevel, uint256) {
        return (proposals[proposalId].threat, proposals[proposalId].anomalyScore);
    }

    // --- Fallback for native payments (optional) ---
    receive() external payable {}
}
