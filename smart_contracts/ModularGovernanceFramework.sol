// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ModularGovernanceFramework
/// @notice Unstoppable, modular, plugin-based on-chain governance for DAOs, protocols, and Web3. Proposals, modular voting, quorum, and event-driven transparency.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IVotingPlugin {
    function getVotes(address voter, uint256 proposalId) external view returns (uint256);
    function validateProposal(uint256 proposalId, address proposer) external view returns (bool);
    function quorum(uint256 proposalId) external view returns (uint256);
    function threshold(uint256 proposalId) external view returns (uint256);
}

interface IExecutionHook {
    function onExecute(uint256 proposalId) external;
}

contract ModularGovernanceFramework is Ownable {
    enum ProposalStatus { Pending, Active, Succeeded, Defeated, Executed, Cancelled }

    struct Proposal {
        address proposer;
        string metadataURI; // Off-chain details (IPFS, Arweave, HTTP)
        bytes callData;     // Calldata for execution
        address target;     // Contract to call on success
        ProposalStatus status;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        uint256 startBlock;
        uint256 endBlock;
        address votingPlugin;
        address executionHook;
        uint256 quorum;
        uint256 threshold;
        uint256 executedAt;
    }

    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string metadataURI, address target, address votingPlugin, address executionHook, uint256 startBlock, uint256 endBlock);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "No such proposal");
        _;
    }

    // --- Proposal Creation ---

    function propose(
        string memory metadataURI,
        address target,
        bytes memory callData,
        address votingPlugin,
        address executionHook,
        uint256 votingPeriod // blocks
    ) external returns (uint256 proposalId) {
        require(votingPlugin != address(0), "No voting plugin");
        require(target != address(0), "No target");
        proposalId = proposalCount++;
        Proposal storage p = proposals[proposalId];
        p.proposer = msg.sender;
        p.metadataURI = metadataURI;
        p.callData = callData;
        p.target = target;
        p.status = ProposalStatus.Pending;
        p.votingPlugin = votingPlugin;
        p.executionHook = executionHook;

        // Plugin-based validation and config
        require(IVotingPlugin(votingPlugin).validateProposal(proposalId, msg.sender), "Plugin reject");
        p.quorum = IVotingPlugin(votingPlugin).quorum(proposalId);
        p.threshold = IVotingPlugin(votingPlugin).threshold(proposalId);

        p.startBlock = block.number;
        p.endBlock = block.number + votingPeriod;
        p.status = ProposalStatus.Active;

        emit ProposalCreated(proposalId, msg.sender, metadataURI, target, votingPlugin, executionHook, p.startBlock, p.endBlock);
    }

    // --- Voting ---

    /// @param support: 0 = against, 1 = for, 2 = abstain
    function castVote(uint256 proposalId, uint8 support) external proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active, "Not active");
        require(block.number >= p.startBlock && block.number <= p.endBlock, "Voting closed");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = IVotingPlugin(p.votingPlugin).getVotes(msg.sender, proposalId);
        require(weight > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support == 1) {
            p.forVotes += weight;
        } else if (support == 0) {
            p.againstVotes += weight;
        } else {
            p.abstainVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    // --- Proposal Status & Execution ---

    function execute(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active || p.status == ProposalStatus.Succeeded, "Not executable");
        require(block.number > p.endBlock, "Voting not ended");
        require(p.forVotes >= p.threshold, "Below threshold");
        require(p.forVotes + p.againstVotes + p.abstainVotes >= p.quorum, "Below quorum");

        p.status = ProposalStatus.Executed;
        p.executedAt = block.timestamp;

        // Call execution hook if set
        if (p.executionHook != address(0)) {
            IExecutionHook(p.executionHook).onExecute(proposalId);
        }
        // Execute proposal action
        (bool ok, ) = p.target.call(p.callData);
        require(ok, "Target call failed");

        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external proposalExists(proposalId) onlyOwner {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Active || p.status == ProposalStatus.Pending, "Cannot cancel");
        p.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    // --- View Functions ---

    function getProposal(uint256 proposalId) external view proposalExists(proposalId) returns (
        address proposer,
        string memory metadataURI,
        address target,
        ProposalStatus status,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        uint256 startBlock,
        uint256 endBlock,
        address votingPlugin,
        address executionHook,
        uint256 quorum,
        uint256 threshold,
        uint256 executedAt
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.metadataURI,
            p.target,
            p.status,
            p.forVotes,
            p.againstVotes,
            p.abstainVotes,
            p.startBlock,
            p.endBlock,
            p.votingPlugin,
            p.executionHook,
            p.quorum,
            p.threshold,
            p.executedAt
        );
    }
}
