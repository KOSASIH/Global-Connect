// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainBountyManager
/// @notice Modular, unstoppable, plugin-based bounty manager for ERC20, ERC721, and native rewards. Supports plugin review/award, milestone or one-shot payouts, DAO/protocol/open-source ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IReviewPlugin {
    function canSubmit(uint256 bountyId, address user, string calldata submissionURI, bytes calldata data) external view returns (bool);
    function canAward(uint256 bountyId, address reviewer, address user, uint256 rewardOrTokenId, bytes calldata data) external view returns (bool);
}

contract UniversalOnChainBountyManager is Ownable {
    enum AssetType { Native, ERC20, ERC721 }
    enum BountyStatus { Open, Reviewing, Awarded, Cancelled, Closed }

    struct Submission {
        address user;
        string submissionURI;
        uint256 timestamp;
        bool awarded;
    }

    struct Bounty {
        address creator;
        AssetType assetType;
        address asset;
        uint256 rewardOrTokenId;
        BountyStatus status;
        address reviewPlugin;
        string metadataURI;
        Submission[] submissions;
        uint256 awardedSubmissionId;
        address awardedUser;
        uint256 createdAt;
        uint256 closedAt;
    }

    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;

    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        AssetType assetType,
        address asset,
        uint256 rewardOrTokenId,
        address reviewPlugin,
        string metadataURI
    );
    event SubmissionReceived(uint256 indexed bountyId, uint256 submissionId, address indexed user, string submissionURI);
    event BountyStatusChanged(uint256 indexed bountyId, BountyStatus status);
    event BountyAwarded(uint256 indexed bountyId, uint256 submissionId, address indexed user, uint256 rewardOrTokenId);
    event BountyClosed(uint256 indexed bountyId);

    // --- Create Bounty ---

    function createBounty(
        AssetType assetType,
        address asset,
        uint256 rewardOrTokenId,
        address reviewPlugin,
        string calldata metadataURI
    ) external payable returns (uint256 bountyId) {
        require(rewardOrTokenId > 0, "Zero reward/tokenId");
        bountyId = bountyCount++;
        Bounty storage b = bounties[bountyId];
        b.creator = msg.sender;
        b.assetType = assetType;
        b.asset = asset;
        b.rewardOrTokenId = rewardOrTokenId;
        b.status = BountyStatus.Open;
        b.reviewPlugin = reviewPlugin;
        b.metadataURI = metadataURI;
        b.createdAt = block.timestamp;

        // Transfer reward to contract
        if (assetType == AssetType.Native) {
            require(msg.value == rewardOrTokenId, "ETH mismatch");
        } else if (assetType == AssetType.ERC20) {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(asset).transferFrom(msg.sender, address(this), rewardOrTokenId), "ERC20 transfer failed");
        } else if (assetType == AssetType.ERC721) {
            require(msg.value == 0, "No ETH for ERC721");
            IERC721(asset).transferFrom(msg.sender, address(this), rewardOrTokenId);
        }

        emit BountyCreated(bountyId, msg.sender, assetType, asset, rewardOrTokenId, reviewPlugin, metadataURI);
        emit BountyStatusChanged(bountyId, BountyStatus.Open);
    }

    // --- Submission ---

    function submit(uint256 bountyId, string calldata submissionURI, bytes calldata pluginData) external {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open, "Not open");
        if (b.reviewPlugin != address(0)) {
            require(IReviewPlugin(b.reviewPlugin).canSubmit(bountyId, msg.sender, submissionURI, pluginData), "Plugin blocked");
        }
        uint256 submissionId = b.submissions.length;
        b.submissions.push(Submission({
            user: msg.sender,
            submissionURI: submissionURI,
            timestamp: block.timestamp,
            awarded: false
        }));
        emit SubmissionReceived(bountyId, submissionId, msg.sender, submissionURI);
    }

    // --- Award ---

    function award(uint256 bountyId, uint256 submissionId, bytes calldata pluginData) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open || b.status == BountyStatus.Reviewing, "Not awardable");
        require(submissionId < b.submissions.length, "Invalid submission");
        Submission storage s = b.submissions[submissionId];
        require(!s.awarded, "Already awarded");
        if (b.reviewPlugin != address(0)) {
            require(IReviewPlugin(b.reviewPlugin).canAward(bountyId, msg.sender, s.user, b.rewardOrTokenId, pluginData), "Award blocked");
        }
        // Transfer reward
        if (b.assetType == AssetType.Native) {
            payable(s.user).transfer(b.rewardOrTokenId);
        } else if (b.assetType == AssetType.ERC20) {
            IERC20(b.asset).transfer(s.user, b.rewardOrTokenId);
        } else if (b.assetType == AssetType.ERC721) {
            IERC721(b.asset).transferFrom(address(this), s.user, b.rewardOrTokenId);
        }
        s.awarded = true;
        b.status = BountyStatus.Awarded;
        b.awardedSubmissionId = submissionId;
        b.awardedUser = s.user;
        emit BountyAwarded(bountyId, submissionId, s.user, b.rewardOrTokenId);
        emit BountyStatusChanged(bountyId, BountyStatus.Awarded);
    }

    // --- Close ---

    function close(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open || b.status == BountyStatus.Reviewing, "Cannot close");
        b.status = BountyStatus.Closed;
        b.closedAt = block.timestamp;
        emit BountyStatusChanged(bountyId, BountyStatus.Closed);
        emit BountyClosed(bountyId);
    }

    // --- Cancel ---

    function cancel(uint256 bountyId) external onlyOwner {
        Bounty storage b = bounties[bountyId];
        require(b.status == BountyStatus.Open, "Not open");
        b.status = BountyStatus.Cancelled;
        // Refund to creator
        if (b.assetType == AssetType.Native) {
            payable(b.creator).transfer(b.rewardOrTokenId);
        } else if (b.assetType == AssetType.ERC20) {
            IERC20(b.asset).transfer(b.creator, b.rewardOrTokenId);
        } else if (b.assetType == AssetType.ERC721) {
            IERC721(b.asset).transferFrom(address(this), b.creator, b.rewardOrTokenId);
        }
        emit BountyStatusChanged(bountyId, BountyStatus.Cancelled);
    }

    // --- View ---

    function getBounty(uint256 bountyId) external view returns (
        address creator,
        AssetType assetType,
        address asset,
        uint256 rewardOrTokenId,
        BountyStatus status,
        address reviewPlugin,
        string memory metadataURI,
        uint256 submissionCount,
        uint256 awardedSubmissionId,
        address awardedUser,
        uint256 createdAt,
        uint256 closedAt
    ) {
        Bounty storage b = bounties[bountyId];
        return (
            b.creator,
            b.assetType,
            b.asset,
            b.rewardOrTokenId,
            b.status,
            b.reviewPlugin,
            b.metadataURI,
            b.submissions.length,
            b.awardedSubmissionId,
            b.awardedUser,
            b.createdAt,
            b.closedAt
        );
    }

    function getSubmission(uint256 bountyId, uint256 submissionId) external view returns (
        address user,
        string memory submissionURI,
        uint256 timestamp,
        bool awarded
    ) {
        Submission storage s = bounties[bountyId].submissions[submissionId];
        return (s.user, s.submissionURI, s.timestamp, s.awarded);
    }
}
