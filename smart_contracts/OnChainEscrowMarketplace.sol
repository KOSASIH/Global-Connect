// SPDX-License-Identifier: MIT
pragma solidity ^0.8..org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDisputePlugin {
    function raiseDispute(uint256 orderId, address by) external;
    function resolveDispute(uint256 orderId, address winner) external;
}

contract OnChainEscrowMarketplace is Ownable {
    enum OrderStatus { Open, Funded, InProgress, Completed, Disputed, Cancelled, Refunded }

    struct Milestone {
        string description;
        uint256 amount;
        bool released;
    }

    struct Order {
        address buyer;
        address seller;
        string metadata orderId);
    event MilestoneReleased(uint256 indexed orderId, uint256 milestoneId, uint256 amount);
    event OrderCompleted(uint256 indexed orderId, address seller, uint256 totalPayout, uint256 fee);
    event OrderDisputed(uint256 indexed orderId, address by);
    event OrderResolved(uint256 indexed orderId, address winner);
    event OrderCancelled(uint256 indexed orderId);
    event OrderRefunded(uint256 indexed orderId, address buyer, uint256 refundAmount);

    // --- Admin Controls ---

    function setFee(uint256 bps, address recipient) external onlyOwner {
        require(bps <= IERC20(token);
        o.totalAmount = totalAmount;
        o.fee = (totalAmount * feeBps) / 10000;
        o.status = OrderStatus.Open;
        o.disputePlugin = disputePlugin;
        o.createdAt = block.timestamp;

        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            o.milestones.push(Milestone({
                description: milestones[i].description,
                amount: milestones[i].amount,
                released: false
            }));
            sum += milestones[i].amount;
        }
        require(sum == totalAmount, "Mil storage o = orders[orderId];
        require(o.status == OrderStatus.Funded || o.status == OrderStatus.InProgress, "Not in progress");
        require(msg.sender == o.buyer, "Not buyer");
        require(o.milestonePointer < o.milestones.length, "All released");
        Milestone storage m = o.milestones[o.milestonePointer];
        require(!m.released, "Already released");

        m.released = true;
        o.releasedAmount += m.amount;
        if (address(o.token) == address(0)) {
            payable(o.seller).transfer(m.amount);
        }uyer).transfer(payout);
            } else {
                o.token.transfer(o.buyer, payout);
            }
        }
        // Fee payout
        if (o.fee > 0 && feeRecipient != address(0)) {
            if (address(o.token) == address(0)) {
                payable(feeRecipient).transfer(o.fee);
            } else {
                o.token.transfer(feeRecipient, o.fee);
            }
        }
        emit OrderResolved(orderId, winner);
    }

    // --- Cancel/Refund ---

    function cancelOrder(uint256 orderId) external {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.status == OrderStatus.Open, "Cannot cancel");
        o.status = OrderStatus.Cancelled;
        emit OrderCancelled(orderId);
    }

    function refundOrder(uint256 orderId) external onlyOwner {
        Order storage o = orders[orderId];
        require(o.status == OrderStatus.Funded || o.status == OrderStatus.InProgress, "Not refundable");
        uint256 refund = o.totalAmount - o.releasedAmount;
        o.status = OrderStatus.Refunded;
        if (address(o.token) == address(0)) {
            payable(o.buyer).transfer(refund);
        } else {
            o.token.transfer(o.buyer, refund);
        }
        emit OrderRefunded(orderId, o.buyer, refund);
    }

    // --- View Functions ---

    function getOrder(uint256 orderId) external view returns (
        address buyer,
        address seller,
        string memory metadataURI,
        address token,
        uint256 totalAmount,
        uint256 fee,
        OrderStatus status,
        uint256 milestoneCount,
        address disputePlugin,
        uint256 createdAt,
        uint256 completedAt,
        uint256 releasedAmount,
        uint256 milestonePointer
    ) {
        Order storage o = orders[orderId];
        return (
            o.buyer,
            o.seller,
            o.metadataURI,
            address(o.token),
            o.totalAmount,
            o.fee,
            o.status,
            o.milestones.length,
            o.disputePlugin,
            o.createdAt,
            o.completed m.amount, m.released);
    }
}
