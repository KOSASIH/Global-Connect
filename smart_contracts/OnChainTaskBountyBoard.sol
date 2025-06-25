// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChainTaskBountyBoard
/// @notice Ultra-advanced, unstoppable, DAO-ready bounty/task board with milestones, multi-claimer, verifiers, and dispute management.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OnChainTaskBountyBoard is Ownable {
    enum BountyStatus { Open, Claimed, Verifying, Disputed, Completed, Cancelled }
    enum PayoutType { Native, ERC20 }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        address verifier;
        bool verified;
        bool disputed;
    }

    struct Bounty {
        address creator;
        string title;
        string description;
        uint256 totalReward;
        IERC20 payoutToken;
        PayoutType payoutType;
        BountyStatus status;
        address[] claimers;
        uint256 currentMilestone;
        Milestone[] milestones;
        mapping(address => bool) isClaimer;
        mapping(address => bool) hasWithdrawn;
        uint256 createdAt;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) private bounties;
    mapping(address => uint256[]) public claimerToBounties;

    event BountyCreated(uint256 indexed bountyId, address indexed creator, string title, uint256 totalReward, PayoutType payoutType, address payoutToken);
    event Claimed(uint256 indexed bountyId, address indexed claimer);
    event MilestoneCompleted(uint256 indexed bountyId, uint256 milestoneIndex, address indexed claimer);
    event MilestoneVerified(uint256 indexed bountyId, uint256 milestoneIndex, address indexed verifier);
    event Disputed(uint256 indexed bountyId, uint256 milestoneIndex, address indexed disputer);
    event DisputeResolved(uint256 indexed bountyId, uint256 milestoneIndex, address indexed resolver, bool approved);
    event RewardWithdrawn(uint256 indexed bountyId, address indexed claimer, uint256 amount);
    event BountyCancelled(uint256 indexed bountyId);

    modifier onlyBountyCreator(uint256 bountyId) {
        require(bounties[bountyId].creator == msg.sender, "Not creator");
        _;
    }
    modifier bountyExists(uint256 bountyId) {
        require(bountyId < bountyCount, "Bounty not exist");
        _;
    }
    modifier onlyClaimer(uint256 bountyId) {
        require(bounties[bountyId].isClaimer[msg.sender], "Not claimer");
        _;
    }

    // --- Bounty Creation ---

    function createBounty(
        string memory title,
        string memory description,
        uint256 totalReward,
        address payoutToken,
        PayoutType payoutType,
        Milestone[] memory milestones
    ) external payable returns (uint256 bountyId) {
        require(totalReward > 0, "Zero reward");
        require(milestones.length > 0, "No milestones");

        bountyId = bountyCount++;
        Bounty storage bounty = bounties[bountyId];
        bounty.creator = msg.sender;
        bounty.title = title;
        bounty.description = description;
        bounty.totalReward = totalReward;
        bounty.payoutToken = IERC20(payoutToken);
        bounty.payoutType = payoutType;
        bounty.status = BountyStatus.Open;
        bounty.createdAt = block.timestamp;

        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            bounty.milestones.push(
                Milestone({
                    description: milestones[i].description,
                    amount: milestones[i].amount,
                    completed: false,
                    verifier: milestones[i].verifier,
                    verified: false,
                    disputed: false
                })
            );
            sum += milestones[i].amount;
        }
        require(sum == totalReward, "Milestone sum != reward");

        // Fund bounty
        if (payoutType == PayoutType.Native) {
            require(msg.value == totalReward, "Native reward mismatch");
        } else {
            require(msg.value == 0, "No native for ERC20");
            require(payoutToken != address(0), "Zero token");
            require(bounty.payoutToken.transferFrom(msg.sender, address(this), totalReward), "ERC20 transfer failed");
        }

        emit BountyCreated(bountyId, msg.sender, title, totalReward, payoutType, payoutToken);
    }

    // --- Claiming ---

    function claim(uint256 bountyId) external bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Bounty closed");
        require(!bounty.isClaimer[msg.sender], "Already claimer");
        bounty.claimers.push(msg.sender);
        bounty.isClaimer[msg.sender] = true;
        claimerToBounties[msg.sender].push(bountyId);
        bounty.status = BountyStatus.Claimed;
        emit Claimed(bountyId, msg.sender);
    }

    // --- Milestone Completion and Verification ---

    function completeMilestone(uint256 bountyId) external onlyClaimer(bountyId) bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Claimed || bounty.status == BountyStatus.Verifying, "Not claimable");
        require(bounty.currentMilestone < bounty.milestones.length, "All milestones done");
        Milestone storage ms = bounty.milestones[bounty.currentMilestone];
        require(!ms.completed, "Milestone already completed");
        ms.completed = true;
        bounty.status = BountyStatus.Verifying;
        emit MilestoneCompleted(bountyId, bounty.currentMilestone, msg.sender);
    }

    function verifyMilestone(uint256 bountyId, bool approved) external bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.currentMilestone < bounty.milestones.length, "No milestone");
        Milestone storage ms = bounty.milestones[bounty.currentMilestone];
        require(ms.completed, "Not completed");
        require(msg.sender == ms.verifier, "Not verifier");
        require(!ms.verified, "Already verified");

        ms.verified = true;
        bounty.status = approved ? BountyStatus.Claimed : BountyStatus.Disputed;
        emit MilestoneVerified(bountyId, bounty.currentMilestone, msg.sender);
        if (!approved) emit Disputed(bountyId, bounty.currentMilestone, msg.sender);
        if (approved) {
            payoutMilestone(bountyId);
            bounty.currentMilestone++;
            // Auto-complete if all milestones done
            if (bounty.currentMilestone == bounty.milestones.length) {
                bounty.status = BountyStatus.Completed;
            }
        }
    }

    // --- Dispute/Arbitration ---

    function resolveDispute(uint256 bountyId, bool approve) external onlyOwner bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        Milestone storage ms = bounty.milestones[bounty.currentMilestone];
        require(bounty.status == BountyStatus.Disputed, "No dispute");
        ms.disputed = false;
        bounty.status = approve ? BountyStatus.Claimed : BountyStatus.Cancelled;
        emit DisputeResolved(bountyId, bounty.currentMilestone, msg.sender, approve);
        if (approve) {
            payoutMilestone(bountyId);
            bounty.currentMilestone++;
        }
    }

    // --- Payouts ---

    function payoutMilestone(uint256 bountyId) internal {
        Bounty storage bounty = bounties[bountyId];
        Milestone storage ms = bounty.milestones[bounty.currentMilestone];
        require(ms.completed && ms.verified, "Not eligible");
        uint256 reward = ms.amount / bounty.claimers.length;
        for (uint256 i = 0; i < bounty.claimers.length; i++) {
            address claimer = bounty.claimers[i];
            if (!bounty.hasWithdrawn[claimer]) {
                bounty.hasWithdrawn[claimer] = true;
                if (bounty.payoutType == PayoutType.Native) {
                    payable(claimer).transfer(reward);
                } else {
                    bounty.payoutToken.transfer(claimer, reward);
                }
                emit RewardWithdrawn(bountyId, claimer, reward);
            }
        }
    }

    function withdrawReward(uint256 bountyId) external onlyClaimer(bountyId) bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Completed, "Not completed");
        require(!bounty.hasWithdrawn[msg.sender], "Already withdrawn");
        uint256 total = bounty.totalReward / bounty.claimers.length;
        bounty.hasWithdrawn[msg.sender] = true;
        if (bounty.payoutType == PayoutType.Native) {
            payable(msg.sender).transfer(total);
        } else {
            bounty.payoutToken.transfer(msg.sender, total);
        }
        emit RewardWithdrawn(bountyId, msg.sender, total);
    }

    // --- Cancellation ---

    function cancelBounty(uint256 bountyId) external onlyBountyCreator(bountyId) bountyExists(bountyId) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.status == BountyStatus.Open, "Cannot cancel");
        bounty.status = BountyStatus.Cancelled;
        // Refund to creator
        if (bounty.payoutType == PayoutType.Native) {
            payable(bounty.creator).transfer(bounty.totalReward);
        } else {
            bounty.payoutToken.transfer(bounty.creator, bounty.totalReward);
        }
        emit BountyCancelled(bountyId);
    }

    // --- View functions ---

    function getBounty(uint256 bountyId) external view bountyExists(bountyId) returns (
        address creator,
        string memory title,
        string memory description,
        uint256 totalReward,
        address payoutToken,
        PayoutType payoutType,
        BountyStatus status,
        uint256 currentMilestone,
        uint256 numMilestones,
        uint256 createdAt,
        address[] memory claimers
    ) {
        Bounty storage bounty = bounties[bountyId];
        return (
            bounty.creator,
            bounty.title,
            bounty.description,
            bounty.totalReward,
            address(bounty.payoutToken),
            bounty.payoutType,
            bounty.status,
            bounty.currentMilestone,
            bounty.milestones.length,
            bounty.createdAt,
            bounty.claimers
        );
    }

    function getMilestone(uint256 bountyId, uint256 milestoneIdx) external view bountyExists(bountyId) returns (
        string memory description,
        uint256 amount,
        bool completed,
        address verifier,
        bool verified,
        bool disputed
    ) {
        Milestone storage ms = bounties[bountyId].milestones[milestoneIdx];
        return (
            ms.description,
            ms.amount,
            ms.completed,
            ms.verifier,
            ms.verified,
            ms.disputed
        );
    }

    function getClaimers(uint256 bountyId) external view bountyExists(bountyId) returns (address[] memory) {
        return bounties[bountyId].claimers;
    }
}
