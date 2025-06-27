// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChainMultiSigOrchestrator
/// @notice Modular, unstoppable on-chain multi-sig orchestration for DAOs, protocols, and teams. Dynamic membership, plugin-based policies, batching, time-locks, event-driven. DAO/governance/treasury ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IPolicyPlugin {
    function isConfirmed(uint256 proposalId, address[] calldata signers, bytes calldata data) external view returns (bool);
}

contract OnChainMultiSigOrchestrator is Ownable {
    enum ProposalStatus { Pending, Confirming, Executed, Cancelled }

    struct Member {
        bool active;
        uint256 weight;
        string role;
    }

    struct Proposal {
        address proposer;
        bytes[] actions;
        uint256 createdAt;
        uint256 executeAfter;
        ProposalStatus status;
        address policyPlugin;
        mapping(address => bool) confirmations;
        address[] confirmers;
        uint256 confirmationsCount;
        string metadataURI;
    }

    uint256 public proposalCount;
    mapping(address => Member) public members;
    address[] public memberList;

    mapping(uint256 => Proposal) public proposals;

    event MemberAdded(address indexed member, string role, uint256 weight);
    event MemberRemoved(address indexed member);
    event MemberRoleUpdated(address indexed member, string newRole, uint256 newWeight);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address policyPlugin, uint256 executeAfter, string metadataURI);
    event ProposalConfirmed(uint256 indexed proposalId, address indexed signer, uint256 confirmations);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    // --- Membership Management ---

    function addMember(address member, string calldata role, uint256 weight) external onlyOwner {
        require(!members[member].active, "Already member");
        members[member] = Member({active: true, weight: weight, role: role});
        memberList.push(member);
        emit MemberAdded(member, role, weight);
    }

    function removeMember(address member) external onlyOwner {
        require(members[member].active, "Not member");
        members[member].active = false;
        emit MemberRemoved(member);
    }

    function updateMemberRole(address member, string calldata newRole, uint256 newWeight) external onlyOwner {
        require(members[member].active, "Not member");
        members[member].role = newRole;
        members[member].weight = newWeight;
        emit MemberRoleUpdated(member, newRole, newWeight);
    }

    function getMembers() external view returns (address[] memory, string[] memory, uint256[] memory) {
        uint256 n = memberList.length;
        string[] memory roles = new string[](n);
        uint256[] memory weights = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            address m = memberList[i];
            roles[i] = members[m].role;
            weights[i] = members[m].weight;
        }
        return (memberList, roles, weights);
    }

    // --- Proposal Lifecycle ---

    function propose(
        bytes[] calldata actions,
        uint256 executeAfter, // block.timestamp + timeLock
        address policyPlugin,
        string calldata metadataURI
    ) external returns (uint256 proposalId) {
        require(members[msg.sender].active, "Not member");
        require(actions.length > 0, "No actions");
        proposalId = proposalCount++;
        Proposal storage p = proposals[proposalId];
        p.proposer = msg.sender;
        p.actions = actions;
        p.createdAt = block.timestamp;
        p.executeAfter = executeAfter;
        p.status = ProposalStatus.Confirming;
        p.policyPlugin = policyPlugin;
        p.metadataURI = metadataURI;
        // Auto-confirm by proposer
        p.confirmations[msg.sender] = true;
        p.confirmers.push(msg.sender);
        p.confirmationsCount = 1;
        emit ProposalCreated(proposalId, msg.sender, policyPlugin, executeAfter, metadataURI);
        emit ProposalConfirmed(proposalId, msg.sender, 1);
    }

    function confirm(uint256 proposalId, bytes calldata pluginData) external {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Confirming, "Not confirming");
        require(members[msg.sender].active, "Not member");
        require(!p.confirmations[msg.sender], "Already confirmed");
        p.confirmations[msg.sender] = true;
        p.confirmers.push(msg.sender);
        p.confirmationsCount += 1;
        emit ProposalConfirmed(proposalId, msg.sender, p.confirmationsCount);

        // Optional auto-execute if policy met
        if (p.policyPlugin != address(0) && IPolicyPlugin(p.policyPlugin).isConfirmed(proposalId, p.confirmers, pluginData)) {
            execute(proposalId);
        }
    }

    function execute(uint256 proposalId) public {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Confirming, "Not confirming");
        require(block.timestamp >= p.executeAfter, "Time lock");
        if (p.policyPlugin != address(0)) {
            require(IPolicyPlugin(p.policyPlugin).isConfirmed(proposalId, p.confirmers, ""), "Policy not met");
        }
        p.status = ProposalStatus.Executed;
        // Execute all actions
        for (uint256 i = 0; i < p.actions.length; i++) {
            (bool success, ) = address(this).call(p.actions[i]);
            require(success, "Action failed");
        }
        emit ProposalExecuted(proposalId);
    }

    function cancel(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(p.status == ProposalStatus.Confirming, "Not cancellable");
        require(msg.sender == p.proposer || msg.sender == owner(), "Not allowed");
        p.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }

    // --- View Functions ---

    function getProposal(uint256 proposalId) external view returns (
        address proposer,
        uint256 createdAt,
        uint256 executeAfter,
        ProposalStatus status,
        address policyPlugin,
        uint256 confirmationsCount,
        string memory metadataURI,
        address[] memory confirmers
    ) {
        Proposal storage p = proposals[proposalId];
        return (
            p.proposer,
            p.createdAt,
            p.executeAfter,
            p.status,
            p.policyPlugin,
            p.confirmationsCount,
            p.metadataURI,
            p.confirmers
        );
    }
}
