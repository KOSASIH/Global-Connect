// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DecentralizedGrantAllocator
/// @notice Ultra-modern, unstoppable, modular on-chain grant allocator with voting, milestones, dispute management, and DAO/plugin integration.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IVotingPlugin {
    function startVote(uint256 grantRoundId, uint256 proposalId) external;
    function vote(uint256 grantRoundId, uint256 proposalId, address voter, uint256 amount) external;
    function getVotes(uint256 grantRoundId, uint256 proposalId) external view returns (uint256);
    function Approved, Rejected, Cancelled }

    struct GrantRound {
        string name;
        string description;
        IERC20 fundingToken;
        uint256 totalFunds;
        uint256 applicationDeadline;
        uint256 votingDeadline;
        GrantStatus status;
        address votingPlugin;
        uint256 proposalCount;
        mapping(uint256 => Proposal) proposals;
        uint256[] proposalIds;
        uint256 createdAt;
    }

    struct Proposal {
        address applicant;
        string title[] milestoneApproved;
        uint256 fundsWithdrawn;
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool approved;
    }

    uint256 public grantRoundCount;
    mapping(uint256 => GrantRound) private grantRounds;

    // Events
    event GrantRoundCreated(uint256 indexed grantRoundId, string name, address fundingToken, uint256 totalFunds, uint256 applicationDeadline, uint256 }

    modifier proposalExists(uint256 grantRoundId, uint256 proposalId) {
        require(grantRounds[grantRoundId].proposals[proposalId].applicant != address(0), "No such proposal");
        _;
    }

    // --- Grant Round Creation ---

    function createGrantRound(
        string calldata name,
        string calldata description,
        address fundingToken,
        uint256 != address(0), "No voting plugin");

        grantRoundId = grantRoundCount++;
        GrantRound storage gr = grantRounds[grantRoundId];
        gr.name = name;
        gr.description = description;
        gr.fundingToken = IERC20(fundingToken);
        gr.totalFunds = totalFunds;
        gr.applicationDeadline = applicationDeadline;
");
        require(amountRequested > 0, "Zero request");
        require(milestones.length > 0, "No milestones");

        uint256 proposalId = gr.proposalCount++;
        Proposal storage p = gr.proposals[proposalId];
        p.applicant = msg.sender;
        p.title = title;
        p.description = description;
        p.amountRequested = amountRequested;
        p.status = ProposalStatus.Pending;
        p.milestoneCount = milestones.length;
        uint256 sum;
        for (uint256 i = grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) onlyOwner {
        GrantRound storage gr = grantRounds[grantRoundId];
        require(gr.status == GrantStatus.Open, "Not open");
        gr.status = GrantStatus.Voting;
        IVotingPlugin(gr.votingPlugin).startVote(grantRoundId, proposalId);
    }

    function vote(uint256 grantRoundId, uint256 proposalId, uint256 amount) external grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) {
        GrantRound storage gr = grantRounds[grantRoundId];
        require(gr.status == GrantStatus.Voting, "Not voting");
        require(block.timestamp <= gr.votingDeadline, "Voting ended");
        IVotingPlugin(gr.votingPlugin).vote(grantRoundId, proposalId, msg.sender, amount);
        emit VoteCast(grantRoundId, proposalId, msg.sender, amount);
    }

    // --- Finalize and Select Approved Proposals ---

    function finalizeGrantRound(uint256 grantRoundId) external grantRoundExists(grantRoundId) onlyOwner {
        GrantRound storage gr = grantRounds[grantRoundId];
        require(block.timestamp > gr.votingDeadline, "Voting not ended");
        require(gr.status == GrantStatus.Voting, "Not voting");
        gr.status = GrantStatus.Finalized;

        uint256[] memory approvedProposals = new uint256[](gr.proposalCount);
        uint256 n;
        for (uint256 i = 0; i < gr.proposalCount; i++) {
            if (IVotingPlugin(gr.votingPlugin).endVote(grantRoundId, i)) {
                gr.proposals[i].status = ProposalStatus.Approved;
                approvedProposals[n++] = i;
            } else {
                gr.proposals[i].status = ProposalStatus.Rejected;
            }
            emit ProposalStatusChanged(grantRoundId, i, gr.proposals[i].status);
        }
        emit GrantRoundFinalized(grantRoundId, approvedProposals);
    }

    // --- Milestone Completion and Approval ---

    function completeMilestone(uint256 grantRoundId, uint256 proposalId, uint256 milestoneId) external grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) {
        Proposal storage p = grantRounds[grantRoundId].proposals[proposalId];
        require(msg.sender == p.applicant, "Not applicant");
        require(p.status == ProposalStatus.Approved, "Not approved");
        Milestone storage ms = p.milestones[milestoneId];
        require(!ms.completed, "Already complete");
        ms.completed = true;
        emit MilestoneCompleted(grantRoundId, proposalId, milestoneId);
    }

    function approveMilestone(uint256 grantRoundId, uint256 proposalId, uint256 milestoneId) external onlyOwner grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) {
        Proposal storage p = grantRounds[grantRoundId].proposals[proposalId];
        require(p.status == ProposalStatus.Approved, "Not approved");
        Milestone storage ms = p.milestones[milestoneId];
        require(ms.completed, "Not completed");
        require(!ms.approved, "Already approved");
        ms.approved = true;
        p.milestoneApproved[milestoneId] = true;
        emit MilestoneApproved(grantRoundId, proposalId, milestoneId);
    }

    // --- Withdraw Funds ---

    function withdrawFunds(uint256 grantRoundId, uint256 proposalId) external grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) {
        Proposal storage p = grantRounds[grantRoundId].proposals[proposalId];
        require(msg.sender == p.applicant, "Not applicant");
        require(p.status == ProposalStatus.Approved, "Not approved");
        uint256 totalAvailable;
        for (uint256 i = 0; i < p.milestoneCount; i++) {
            if (p.milestones[i].approved && !p.milestoneApproved[i]) {
                totalAvailable += p.milestones[i].amount;
                p.milestoneApproved[i] = true;
            }
        }
        require(totalAvailable > 0, "Nothing to withdraw");
        p.fundsWithdrawn += totalAvailable;
        require(grantRounds[grantRoundId].fundingToken.transfer(msg.sender, totalAvailable), "Transfer failed");
        emit FundsWithdrawn(grantRoundId, proposalId, msg.sender, totalAvailable);
    }

    // --- Cancel Grant Round ---

    function cancelGrantRound(uint256 grantRoundId) external grantRoundExists(grantRoundId) onlyOwner {
        GrantRound storage gr = grantRounds[grantRoundId];
        require(gr.status == GrantStatus.Open || gr.status == GrantStatus.Voting, "Cannot cancel");
        gr.status = GrantStatus.Cancelled;
        require(gr.fundingToken.transfer(owner(), gr.totalFunds), "Refund failed");
        emit GrantRoundCancelled(grantRoundId);
    }

    // --- View Functions ---

    function getGrantRound(uint256 grantRoundId) external view grantRoundExists(grantRoundId) returns (
        string memory name,
        string memory description,
        address fundingToken,
        uint256 totalFunds,
        uint256 applicationDeadline,
        uint256 votingDeadline,
        GrantStatus status,
        address votingPlugin,
        uint256 proposalCount,
        uint256 createdAt
    ) {
        GrantRound storage gr = grantRounds[grantRoundId];
        return (
            gr.name,
            gr.description,
            address(gr.fundingToken),
            gr.totalFunds,
            gr.applicationDeadline,
            gr.votingDeadline,
            gr.status,
            gr.votingPlugin,
            gr.proposalCount,
            gr.createdAt
        );
    }

    function getProposal(uint256 grantRoundId, uint256 proposalId) external view grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) returns (
        address applicant,
        string memory title,
        string memory description,
        uint256 amountRequested,
        ProposalStatus status,
        uint256 votes,
        uint256 milestoneCount,
        uint256 fundsWithdrawn,
        bool[] memory milestoneApproved
    ) {
        Proposal storage p = grantRounds[grantRoundId].proposals[proposalId];
        return (
            p.applicant,
            p.title,
            p.description,
            p.amountRequested,
            p.status,
            p.votes,
            p.milestoneCount,
            p.fundsWithdrawn,
            p.milestoneApproved
        );
    }

    function getMilestone(uint256 grantRoundId, uint256 proposalId, uint256 milestoneId) external view grantRoundExists(grantRoundId) proposalExists(grantRoundId, proposalId) returns (
        string memory description,
        uint256 amount,
        bool completed,
        bool approved
    ) {
        Milestone storage ms = grantRounds[grantRoundId].proposals[proposalId].milestones[milestoneId];
        return (
            ms.description,
            ms.amount,
            ms.completed,
            ms.approved
        );
    }
}
