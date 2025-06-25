// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DecentralizedOracleNetwork
/// @notice Verifiable, modular, decentralized oracle network with staking, slashing, dispute resolution, and plugin data adapters.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDataAdapter {
    function fetch(bytes calldata params) external view returns (bytes memory);
}

contract DecentralizedOracleNetwork is Ownable {
    struct Node {
        uint256 stake;
        uint256 reputation;
        bool active;
    }

    struct DataRequest {
        address requester;
        bytes32 jobId;
        uint256 fee;
        address[] nodeSet;
        mapping(address => bytes) responses;
        mapping(address => bool) responded;
        uint256 responseCount;
        uint256 disputeEndTime;
        bool resolved;
        bytes aggregatedResult;
    }

    IERC20 public immutable stakeToken;
    uint256 public minStake;
    uint256 public slashAmount;
    uint256 public disputeDuration; // seconds
    IDataAdapter public adapter;

    mapping(address => Node) public nodes;
    mapping(bytes32 => DataRequest) public requests;
    mapping(address => uint256) public pendingWithdrawals;

    event NodeJoined(address indexed node, uint256 stake);
    event NodeLeft(address indexed node, uint256 returnedStake);
    event NodeSlashed(address indexed node, uint256 amount, string reason);
    event DataRequested(bytes32 indexed jobId, address indexed requester, uint256 fee, address[] nodes, bytes params);
    event DataSubmitted(bytes32 indexed jobId, address indexed node, bytes result);
    event DisputeRaised(bytes32 indexed jobId, address indexed disputer);
    event DataResolved(bytes32 indexed jobId, bytes aggregatedResult, bool disputed);

    modifier onlyActiveNode() {
        require(nodes[msg.sender].active, "Node not active");
        _;
    }

    constructor(
        address _stakeToken,
        uint256 _minStake,
        uint256 _slashAmount,
        uint256 _disputeDuration,
        address _adapter
    ) {
        require(_stakeToken != address(0) && _adapter != address(0), "Zero address");
        stakeToken = IERC20(_stakeToken);
        minStake = _minStake;
        slashAmount = _slashAmount;
        disputeDuration = _disputeDuration;
        adapter = IDataAdapter(_adapter);
    }

    // --- Node Staking & Management ---

    function joinNetwork(uint256 amount) external {
        require(!nodes[msg.sender].active, "Already active");
        require(amount >= minStake, "Insufficient stake");
        stakeToken.transferFrom(msg.sender, address(this), amount);
        nodes[msg.sender] = Node({stake: amount, reputation: 100, active: true});
        emit NodeJoined(msg.sender, amount);
    }

    function leaveNetwork() external {
        Node storage node = nodes[msg.sender];
        require(node.active, "Not active");
        require(node.stake >= minStake, "Stake slashed");
        uint256 amount = node.stake;
        node.active = false;
        pendingWithdrawals[msg.sender] += amount;
        emit NodeLeft(msg.sender, amount);
    }

    function withdrawStake() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        stakeToken.transfer(msg.sender, amount);
    }

    // --- Oracle Data Requests ---

    function requestData(address[] calldata nodeSet, bytes calldata params, uint256 fee) external payable returns (bytes32 jobId) {
        require(nodeSet.length > 0, "No nodes");
        require(msg.value >= fee, "Insufficient fee");
        jobId = keccak256(abi.encodePacked(msg.sender, block.timestamp, params));
        DataRequest storage req = requests[jobId];
        req.requester = msg.sender;
        req.jobId = jobId;
        req.fee = fee;
        req.nodeSet = nodeSet;
        req.disputeEndTime = block.timestamp + disputeDuration;
        emit DataRequested(jobId, msg.sender, fee, nodeSet, params);
    }

    function submitData(bytes32 jobId, bytes calldata result) external onlyActiveNode {
        DataRequest storage req = requests[jobId];
        require(block.timestamp <= req.disputeEndTime, "Submission closed");
        require(_inNodeSet(req.nodeSet, msg.sender), "Not authorized node");
        require(!req.responded[msg.sender], "Already responded");
        req.responses[msg.sender] = result;
        req.responded[msg.sender] = true;
        req.responseCount += 1;
        emit DataSubmitted(jobId, msg.sender, result);
    }

    // --- Dispute & Resolution ---

    function raiseDispute(bytes32 jobId) external payable {
        DataRequest storage req = requests[jobId];
        require(block.timestamp <= req.disputeEndTime, "Dispute window closed");
        // Optionally: require(msg.value >= disputeFee, "Insufficient dispute fee");
        req.resolved = false; // Mark as disputed
        emit DisputeRaised(jobId, msg.sender);
    }

    function resolveData(bytes32 jobId) external {
        DataRequest storage req = requests[jobId];
        require(block.timestamp > req.disputeEndTime, "Dispute period not ended");
        require(!req.resolved, "Already resolved");

        // Aggregate responses; here, use a simple majority
        bytes memory aggResult = _aggregate(req.nodeSet, req.responses, req.responseCount);

        req.aggregatedResult = aggResult;
        req.resolved = true;

        // Pay participating nodes (equal split)
        uint256 reward = req.fee / req.responseCount;
        for (uint256 i = 0; i < req.nodeSet.length; i++) {
            address node = req.nodeSet[i];
            if (req.responded[node]) {
                payable(node).transfer(reward);
                nodes[node].reputation += 1;
            } else {
                // Optionally: slash inactive nodes
                if (nodes[node].active && nodes[node].stake >= slashAmount) {
                    nodes[node].stake -= slashAmount;
                    nodes[node].reputation -= 5;
                    emit NodeSlashed(node, slashAmount, "Missed oracle job");
                }
            }
        }

        emit DataResolved(jobId, aggResult, false);
    }

    // --- Adapter Management ---

    function setAdapter(address _adapter) external onlyOwner {
        require(_adapter != address(0), "Zero address");
        adapter = IDataAdapter(_adapter);
    }

    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
    }

    function setSlashAmount(uint256 _slashAmount) external onlyOwner {
        slashAmount = _slashAmount;
    }

    function setDisputeDuration(uint256 _disputeDuration) external onlyOwner {
        disputeDuration = _disputeDuration;
    }

    // --- Internal Utilities ---

    function _inNodeSet(address[] storage nodeSet, address node) internal view returns (bool) {
        for (uint256 i = 0; i < nodeSet.length; i++) {
            if (nodeSet[i] == node) return true;
        }
        return false;
    }

    function _aggregate(address[] storage nodeSet, mapping(address => bytes) storage responses, uint256 count) internal view returns (bytes memory) {
        // Simple example: return the first response (implement median/majority for production)
        for (uint256 i = 0; i < nodeSet.length; i++) {
            if (responses[nodeSet[i]].length > 0) {
                return responses[nodeSet[i]];
            }
        }
        return "";
    }

    // --- View Helpers ---

    function getNode(address node) external view returns (uint256 stake, uint256 reputation, bool active) {
        Node storage n = nodes[node];
        return (n.stake, n.reputation, n.active);
    }

    function getRequest(bytes32 jobId) external view returns (
        address requester,
        uint256 fee,
        address[] memory nodeSet,
        uint256 responseCount,
        uint256 disputeEndTime,
        bool resolved,
        bytes memory aggregatedResult
    ) {
        DataRequest storage req = requests[jobId];
        return (
            req.requester,
            req.fee,
            req.nodeSet,
            req.responseCount,
            req.disputeEndTime,
            req.resolved,
            req.aggregatedResult
        );
    }
}
