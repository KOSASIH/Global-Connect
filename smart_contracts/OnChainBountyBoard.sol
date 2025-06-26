// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChainBountyBoard
/// @notice Modular, unstoppable, event-driven bounty/task board for DAOs, OSS, protocols. Plugin-based judging, milestone payouts, ERC20/native, public goods ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISubmissionPlugin {
    function onSubmit(uint256 bountyId, uint256 submissionId, address solver, string calldata uri) external;
}

interface IJudgePlugin {
    function judge(uint256 bountyId, uint256[] calldata submissionIds) external returns (uint256 winnerSubmissionId);
}

contract OnChainBountyBoard is Ownable {
    enum BountyStatus { Open, Reviewing, Awarded, Cancelled }
    enum SubmissionStatus { Submitted, Accepted, Rejected, Paid, Cancelled }

    struct Milestone {
        string description;
        uint256 amount;
        bool released;
    }

    struct Bounty {
        address poster;
        string metadataURI;
        IERC20 token; // address(0) = native
        uint256 totalReward;
        BountyStatus status;
        address judgePlugin;
        address submissionPlugin;
        uint256 deadline;
        uint256 createdAt;
        uint256 awardedSubmission;
        uint256[] submissions;
        Milestone[] milestones;
        uint256 milestonePointer;
    }

    struct Submission {
        address solver;
        string uri; // Off-chain submission (IPFS, HTTP, etc.)
        SubmissionStatus status;
        uint256 bountyId;
        uint256 createdAt;
        uint256 paidAmount;
        uint256 milestonePointer;
    }

    uint256 public bountyCount;
    uint256 public submissionCount;
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public bountySubmissions;

    event BountyPosted(uint256 indexed bountyId, address indexed poster, string metadataURI, address token, uint256 totalReward, address judgePlugin, address submissionPlugin, uint256 deadline);
    event SubmissionMade(uint256 indexed bountyId, uint256 indexed submissionId, address indexed solver, string uri);
    event BountyStatusChanged(uint256 indexed bountyId, BountyStatus status);
    event SubmissionStatusChanged(uint256 indexed submissionId, SubmissionStatus status);
    event MilestoneReleased(uint256 indexed bountyId, uint256 indexed submissionId, uint256 milestoneId, uint256 amount);
    event BountyAwarded(uint256 indexed bountyId, uint256 indexed submissionId, address solver);

    // --- Bounty Posting ---

    function postBounty(
        string calldata metadataURI,
        address token,
        uint256 totalReward,
        Milestone[] calldata milestones,
        address judgePlugin,
        address submissionPlugin,
        uint256 deadline
    ) external payable returns (uint256 bountyId) {
        require(totalReward > 0, "Zero reward");
        require(deadline > block.timestamp, "Invalid deadline");
        require(judgePlugin != address(0), "No judge plugin");
        require(milestones.length > 0, "No milestones");

        bountyId = bountyCount++;
        Bounty storage b = bounties[bountyId];
        b.poster = msg.sender;
        b.metadataURI = metadataURI;
        b.token = IERC20(token);
        b.totalReward = totalReward;
        b.status = BountyStatus.Open;
        b.judgePlugin = judgePlugin;
        b.submissionPlugin = submissionPlugin;
        b.deadline = deadline;
        b.createdAt = block.timestamp;

        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            b.milestones.push(Milestone({
                description: milestones[i].description,
                amount: milestones[i].amount,
                released: false
            }));
            sum += milestones[i].amount;
        }
        require(sum == totalReward, "Milestones != totalReward");

        if (address(b.token) == address(0)) {
            require(msg.value == totalReward, "ETH mismatch");
        } else {
            require(msg.value == 0, "ETH not allowed");
            require(b.token.transferFrom(msg.sender, address(this), totalReward), "ERC20 transfer failed");
        }

        emit BountyPosted(bountyId, msg.sender, metadataURI, token, totalReward, judgePlugin, submissionPlugin, deadline);
        emit BountyStatusChanged(bountyId, BountyStatus.Open);
    }

    // --- Submissions ---

    function submit(uint256 bountyId, string calldata uri) external returns (uint256 submissionId) {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open, "Not open");
        require(block.timestamp < b.deadline, "Deadline passed");

        submissionId = submissionCount++;
        Submission storage s = submissions[submissionId];
        s.solver = msg.sender;
        s.uri = uri;
        s.status = SubmissionStatus.Submitted;
        s.bountyId = bountyId;
        s.createdAt = block.timestamp;

        b.submissions.push(submissionId);
        bountySubmissions[bountyId].push(submissionId);

        if (b.submissionPlugin != address(0)) {
            ISubmissionPlugin(b.submissionPlugin).onSubmit(bountyId, submissionId, msg.sender, uri);
        }

        emit SubmissionMade(bountyId, submissionId, msg.sender, uri);
        emit SubmissionStatusChanged(submissionId, SubmissionStatus.Submitted);
    }

    // --- Reviewing & Judging ---

    function startReview(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open, "Not open");
        b.status = BountyStatus.Reviewing;
        emit BountyStatusChanged(bountyId, BountyStatus.Reviewing);
    }

    function judgeBounty(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Reviewing, "Not reviewing");
        uint256[] memory subIds = b.submissions;
        uint256 winnerId = IJudgePlugin(b.judgePlugin).judge(bountyId, subIds);
        b.status = BountyStatus.Awarded;
        b.awardedSubmission = winnerId;
        submissions[winnerId].status = SubmissionStatus.Accepted;
        emit BountyAwarded(bountyId, winnerId, submissions[winnerId].solver);
        emit BountyStatusChanged(bountyId, BountyStatus.Awarded);
        emit SubmissionStatusChanged(winnerId, SubmissionStatus.Accepted);
    }

    // --- Milestone/Reward Release ---

    function releaseMilestone(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Awarded, "Not awarded");
        uint256 submissionId = b.awardedSubmission;
        Submission storage s = submissions[submissionId];
        require(s.status == SubmissionStatus.Accepted || s.status == SubmissionStatus.Paid, "Not accepted/paid");
        require(b.milestonePointer < b.milestones.length, "All released");
        Milestone storage m = b.milestones[b.milestonePointer];
        require(!m.released, "Already released");

        m.released = true;
        s.paidAmount += m.amount;
        s.status = SubmissionStatus.Paid;
        s.milestonePointer += 1;

        if (address(b.token) == address(0)) {
            payable(s.solver).transfer(m.amount);
        } else {
            b.token.transfer(s.solver, m.amount);
        }
        b.milestonePointer += 1;

        emit MilestoneReleased(bountyId, submissionId, b.milestonePointer - 1, m.amount);
        emit SubmissionStatusChanged(submissionId, SubmissionStatus.Paid);
    }

    // --- Cancel ---

    function cancelBounty(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open || b.status == BountyStatus.Reviewing, "Not cancellable");
        b.status = BountyStatus.Cancelled;
        if (address(b.token) == address(0)) {
            payable(b.poster).transfer(b.totalReward);
        } else {
            b.token.transfer(b.poster, b.totalReward);
        }
        emit BountyStatusChanged(bountyId, BountyStatus.Cancelled);
    }

    function cancelSubmission(uint256 submissionId) external {
        Submission storage s = submissions[submissionId];
        require(msg.sender == s.solver || msg.sender == owner(), "Not allowed");
        s.status = SubmissionStatus.Cancelled;
        emit SubmissionStatusChanged(submissionId, SubmissionStatus.Cancelled);
    }

    // --- View Functions ---

    function getBounty(uint256 bountyId) external view returns (
        address poster,
        string memory metadataURI,
        address token,
        uint256 totalReward,
        BountyStatus status,
        address judgePlugin,
        address submissionPlugin,
        uint256 deadline,
        uint256 createdAt,
        uint256 awardedSubmission,
        uint256 submissionCount_,
        uint256 milestoneCount,
        uint256 milestonePointer
    ) {
        Bounty storage b = bounties[bountyId];
        return (
            b.poster,
            b.metadataURI,
            address(b.token),
            b.totalReward,
            b.status,
            b.judgePlugin,
            b.submissionPlugin,
            b.deadline,
            b.createdAt,
            b.awardedSubmission,
            b.submissions.length,
            b.milestones.length,
            b.milestonePointer
        );
    }

    function getSubmission(uint256 submissionId) external view returns (
        address solver,
        string memory uri,
        SubmissionStatus status,
        uint256 bountyId,
        uint256 createdAt,
        uint256 paidAmount,
        uint256 milestonePointer
    ) {
        Submission storage s = submissions[submissionId];
        return (
            s.solver,
            s.uri,
            s.status,
            s.bountyId,
            s.createdAt,
            s.paidAmount,
            s.milestonePointer
        );
    }

    function getMilestone(uint256 bountyId, uint256 milestoneId) external view returns (
        string memory description,
        uint256 amount,
        bool released
    ) {
        Milestone storage m = bounties[bountyId].milestones[milestoneId];
        return (m.description, m.amount, m.released);
    }

    function getBountySubmissions(uint256 bountyId) external view returns (uint256[] memory) {
        return bountySubmissions[bountyId];
    }
}
