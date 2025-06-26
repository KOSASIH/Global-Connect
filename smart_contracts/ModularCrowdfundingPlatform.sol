// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title ModularCrowdfundingPlatform
/// @notice Unstoppable, modular, event-driven crowdfunding for DAOs, protocols, and creators. Milestones, plugin rewards, programmable refunds/fees. DAO/OSS/DeFi ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRewardPlugin {
    function onFund(uint256 campaignId, address funder, uint256 amount) external;
}

interface IFeePlugin {
    function getFee(uint256 campaignId, address funder, uint256 amount) external view returns (uint256);
}

contract ModularCrowdfundingPlatform is Ownable {
    enum CampaignStatus { Active, Successful, Failed, Cancelled, Finalized }

    struct Milestone {
        string description;
        uint256 targetAmount;
        uint256 releasedAmount;
        bool released;
    }

    struct Campaign {
        address creator;
        string metadataURI;
        IERC20 token; // address(0) = native
       .metadataURI = metadataURI;
        c.token = IERC20(token);
        c.goal = goal;
        c.status = CampaignStatus.Active;
        c.deadline = deadline;
        c.rewardPlugin = rewardPlugin;
        c.feePlugin = feePlugin;
        c.createdAt = block.timestamp;
        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            c.milestones.push(Milestone({
                description: milestones[i].description,
                targetAmount: milestones[i].targetAmount,
                releasedAmount: 0,
                released: false
            }));
            sum += milestones[i        require(amount > 0, "Zero amount");

        uint256 fee = _getFee(campaignId, msg.sender, amount);
        uint256 net = amount - fee;

        if (address(c.token) == address(0)) {
            require(msg.value == amount, "ETH mismatch");
            if (fee > 0 && platformFeeRecipient != address(0)) {
                payable(platformFeeRecipient).            }
        } else {
            require(msg.value == 0, "ETH not allowed");
            require(c.token.transferFrom(msg.sender, address(this), amount), "ERC20 transfer failed");
            if (fee > 0 && platformFeeRecipient != address(0)) {
                c.token.transfer(platformFeeRecipient, fee);
                c.feePaid += fee;
            }
        }

        c.raised += net;
        c.funders[msg.sender] += net;

        if (c.rewardPlugin != address(0)) {
            IRewardPlugin(c.rewardPlugin).onFund(campaignId, msg.sender, net);
        }

        emit Funded(campaignId, msg.sender,Finalized(campaignId, c.status);
    }

    function refund(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(c.status == CampaignStatus.Failed, "Not failed");
        require(!c.refunded[msg.sender], "Already refunded");
        uint256 amount = c.funders[msg.sender];
        require(amount > 0, "Nothing to refund");
        c.refunded[msg.sender] = true;
        if (address(c.token) == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            c.token.transfer(msg.sender, amount);
        }
        emit Refunded(campaignId, msg.sender, amount);
    }

    // --- Internal Fee Logic ---

    function _getFee(uint256 campaignId, address funder, uint256 amount) internal view returns (uint256) {
        Campaign storage c = campaigns[campaignId];
        if (c.feePlugin != address(0)) {
            return IFeePlugin(c.feePlugin).getFee(campaignId, funder, amount);
        }
        return (amount * platformFeeBps) / 10000;
    }

    // --- View Functions ---

    function getCampaign(uint256 campaignId) external view returns (
        address creator,
        string memory metadataURI,
        address token,
        uint256 goal,
        uint256 raised,
        CampaignStatus status,
        uint256 deadline,
        uint256 milestoneCount,
        address rewardPlugin,
        address feePlugin,
        uint256 feePaid,
        uint256 createdAt,
        uint256 finalizedAt
    ) {
        Campaign storage c = campaigns[campaignId];
        return (
            c.creator,
            c.metadataURI,
            address(c.token),
            c.goal,
            c.raised,
            c.status,
            c.deadline,
            c.milestones.length,
            c.rewardPlugin,
            c.feePlugin,
            c.feePaid,
            c.createdAt,
            c.finalizedAt
        );
    }

    function getMilestone(uint256 campaignId, uint256 milestoneId) external view returns (
        string memory description,
        uint256 targetAmount,
        uint256 releasedAmount,
        bool released
    ) {
        Milestone storage m = campaigns[campaignId].milestones[milestoneId];
        return (m.description, m.targetAmount, m.releasedAmount, m.released);
    }

    function getFunderAmount(uint256 campaignId, address funder) external view returns (uint256) {
        return campaigns[campaignId].funders[funder];
    }
}
