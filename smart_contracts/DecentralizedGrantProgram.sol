// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DecentralizedGrantProgram
/// @notice Modular, unstoppable, event-driven on-chain grant program with plugin-based judging, milestones, and permissionless applications. DAO/public goods/OSS/research ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IJudgePlugin {
    function judge(uint256 roundId, uint256[] calldata applicationIds) external returns (uint256[] memory winners);
}

contract DecentralizedGrantProgram is Ownable {
    enum RoundStatus { Open, Reviewing, Judged, Funded, Cancelled }
    enum ApplicationStatus { Submitted, Accepted, Rejected, Funded, Cancelled }

    struct Milestone {
        string description;
        uint256 amount;
        bool released;
    }

    struct Round {
        string metadataURI;         // Off-chain details (IPFS, HTTP)
        IERC20 token;               // address(0) = native
        uint256 totalFunding;
        uint256 allocated;
        RoundStatus status;
        address judgePlugin;
        uint256 createdAt;
        uint256 judgingAt;
        uint256 fundedAt;
        uint256[] applications;
        uint256[] winners;
    }

    struct Application {
        address applicant;
        string metadataURI;         // Off-chain proposal
        ApplicationStatus status;
        uint256 roundId;
        Milestone[] milestones;
        uint256 totalRequested;
        uint256 fundedAmount;
        uint256 milestonePointer;
        uint256 createdAt;
    }

    uint256 public roundCount;
    uint256 public applicationCount;

    mapping(uint256 => Round) public rounds;
    mapping(uint256 => Application) public applications;
    mapping(uint256 => uint256[]) public roundApplications; // roundId => applicationIds

    event RoundCreated(uint256 indexed roundId, string metadataURI, address token, uint256 totalFunding, address judgePlugin);
    event ApplicationSubmitted(uint256 indexed roundId, uint256 indexed applicationId, address indexed applicant, string metadataURI, uint256 totalRequested);
    event ApplicationStatusChanged(uint256 indexed applicationId, ApplicationStatus status);
    event RoundStatusChanged(uint256 indexed roundId, RoundStatus status);
    event MilestoneReleased(uint256 indexed applicationId, uint256 milestoneId, uint256 amount);
    event RoundJudged(uint256 indexed roundId, uint256[] winners);

    // --- Round Management ---

    function createRound(
        string calldata metadataURI,
        address token,
        uint256 totalFunding,
        address judgePlugin
    ) external payable returns (uint256 roundId) {
        require(totalFunding > 0, "Zero funding");
        require(judgePlugin != address(0), "No judge plugin");
        roundId = roundCount++;
        Round storage r = rounds[roundId];
        r.metadataURI = metadataURI;
        r.token = IERC20(token);
        r.totalFunding = totalFunding;
        r.status = RoundStatus.Open;
        r.judgePlugin = judgePlugin;
        r.createdAt = block.timestamp;
        if (token == address(0)) {
            require(msg.value == totalFunding, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), totalFunding), "ERC20 transfer failed");
        }
        emit RoundCreated(roundId, metadataURI, token, totalFunding, judgePlugin);
    }

    function setRoundStatus(uint256 roundId, RoundStatus status) external onlyOwner {
        rounds[roundId].status = status;
        emit RoundStatusChanged(roundId, status);
    }

    // --- Application Management ---

    function submitApplication(
        uint256 roundId,
        string calldata metadataURI,
        Milestone[] calldata milestones,
        uint256 totalRequested
    ) external returns (uint256 applicationId) {
        require(roundId < roundCount, "No such round");
        Round storage r = rounds[roundId];
        require(r.status == RoundStatus.Open, "Not open");
        require(totalRequested > 0, "Zero requested");
        require(milestones.length > 0, "No milestones");

        applicationId = applicationCount++;
        Application storage a = applications[applicationId];
        a.applicant = msg.sender;
        a.metadataURI = metadataURI;
        a.status = ApplicationStatus.Submitted;
        a.roundId = roundId;
        a.totalRequested = totalRequested;
        a.createdAt = block.timestamp;
        for (uint256 i = 0; i < milestones.length; i++) {
            a.milestones.push(Milestone({
                description: milestones[i].description,
                amount: milestones[i].amount,
                released: false
            }));
        }
        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            sum += milestones[i].amount;
        }
        require(sum == totalRequested, "Milestones != requested");

        rounds[roundId].applications.push(applicationId);
        roundApplications[roundId].push(applicationId);

        emit ApplicationSubmitted(roundId, applicationId, msg.sender, metadataURI, totalRequested);
        emit ApplicationStatusChanged(applicationId, ApplicationStatus.Submitted);
    }

    // --- Judging ---

    function startReview(uint256 roundId) external onlyOwner {
        Round storage r = rounds[roundId];
        require(r.status == RoundStatus.Open, "Not open");
        r.status = RoundStatus.Reviewing;
        emit RoundStatusChanged(roundId, RoundStatus.Reviewing);
    }

    function judgeRound(uint256 roundId) external onlyOwner {
        Round storage r = rounds[roundId];
        require(r.status == RoundStatus.Reviewing, "Not reviewing");
        uint256[] memory appIds = r.applications;
        uint256[] memory winners = IJudgePlugin(r.judgePlugin).judge(roundId, appIds);
        r.winners = winners;
        r.status = RoundStatus.Judged;
        r.judgingAt = block.timestamp;
        for (uint256 i = 0; i < winners.length; i++) {
            applications[winners[i]].status = ApplicationStatus.Accepted;
            emit ApplicationStatusChanged(winners[i], ApplicationStatus.Accepted);
        }
        emit RoundJudged(roundId, winners);
        emit RoundStatusChanged(roundId, RoundStatus.Judged);
    }

    // --- Funding Milestones ---

    function fundMilestone(uint256 applicationId) external onlyOwner {
        Application storage a = applications[applicationId];
        require(a.status == ApplicationStatus.Accepted || a.status == ApplicationStatus.Funded, "Not accepted/funded");
        Round storage r = rounds[a.roundId];
        require(r.status == RoundStatus.Judged || r.status == RoundStatus.Funded, "Not judged/funded");
        require(a.milestonePointer < a.milestones.length, "All released");
        Milestone storage m = a.milestones[a.milestonePointer];
        require(!m.released, "Already released");
        require(r.allocated + m.amount <= r.totalFunding, "Not enough funding");

        m.released = true;
        a.fundedAmount += m.amount;
        r.allocated += m.amount;
        a.status = ApplicationStatus.Funded;
        if (address(r.token) == address(0)) {
            payable(a.applicant).transfer(m.amount);
        } else {
            r.token.transfer(a.applicant, m.amount);
        }
        a.milestonePointer += 1;
        emit MilestoneReleased(applicationId, a.milestonePointer - 1, m.amount);
    }

    // --- Cancel ---

    function cancelRound(uint256 roundId) external onlyOwner {
        rounds[roundId].status = RoundStatus.Cancelled;
        emit RoundStatusChanged(roundId, RoundStatus.Cancelled);
    }

    function cancelApplication(uint256 applicationId) external {
        Application storage a = applications[applicationId];
        require(msg.sender == a.applicant || msg.sender == owner(), "Not allowed");
        a.status = ApplicationStatus.Cancelled;
        emit ApplicationStatusChanged(applicationId, ApplicationStatus.Cancelled);
    }

    // --- View Functions ---

    function getRound(uint256 roundId) external view returns (
        string memory metadataURI,
        address token,
        uint256 totalFunding,
        uint256 allocated,
        RoundStatus status,
        address judgePlugin,
        uint256 createdAt,
        uint256 judgingAt,
        uint256 fundedAt,
        uint256[] memory applications,
        uint256[] memory winners
    ) {
        Round storage r = rounds[roundId];
        return (
            r.metadataURI,
            address(r.token),
            r.totalFunding,
            r.allocated,
            r.status,
            r.judgePlugin,
            r.createdAt,
            r.judgingAt,
            r.fundedAt,
            r.applications,
            r.winners
        );
    }

    function getApplication(uint256 applicationId) external view returns (
        address applicant,
        string memory metadataURI,
        ApplicationStatus status,
        uint256 roundId,
        uint256 milestoneCount,
        uint256 totalRequested,
        uint256 fundedAmount,
        uint256 milestonePointer,
        uint256 createdAt
    ) {
        Application storage a = applications[applicationId];
        return (
            a.applicant,
            a.metadataURI,
            a.status,
            a.roundId,
            a.milestones.length,
            a.totalRequested,
            a.fundedAmount,
            a.milestonePointer,
            a.createdAt
        );
    }

    function getMilestone(uint256 applicationId, uint256 milestoneId) external view returns (
        string memory description,
        uint256 amount,
        bool released
    ) {
        Milestone storage m = applications[applicationId].milestones[milestoneId];
        return (m.description, m.amount, m.released);
    }

    function getRoundApplications(uint256 roundId) external view returns (uint256[] memory) {
        return roundApplications[roundId];
    }
}
