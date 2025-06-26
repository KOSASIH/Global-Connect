// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title AutomatedOnChainEscrow
/// @notice Ultra-secure, unstoppable, automated on-chain escrow for payments, milestones, and programmable release with dispute/arbitration plugins. DAO/marketplace ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IArbitrationPlugin {
    function requestArbitration(uint256 escrowId, address initiator) external;
    function resolveDispute(uint256 escrowId, bool releaseToPayee) external;
}

interface IConditionPlugin {
    function isReleaseAllowed(uint256 escrowId) external view returns (bool);
}

contract AutomatedOnChainEscrow is Ownable {
    enum EscrowStatus { Open, InProgress, Dispute, Completed, Cancelled }

    struct Milestone {
        string description;
        uint256 amount;
        bool released;
        bool disputed;
    }

    struct Escrow {
        address payer;
        address payee;
        IERC20 token;
        uint256 totalAmount;
        EscrowStatus status;
        uint256 currentMilestone;
        Milestone[] milestones;
        address arbitrationPlugin;
        address conditionPlugin;
        uint256 createdAt;
        uint256 completedAt;
    }

    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed payer, address indexed payee, address token, uint256 totalAmount);
    event MilestoneReleased(uint256 indexed escrowId, uint256 milestoneId, address payee, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId, uint256 milestoneId, address initiator);
    event EscrowResolved(uint256 indexed escrowId, uint256 milestoneId, bool releasedToPayee);
    event EscrowCancelled(uint256 indexed escrowId);

    modifier onlyPayer(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].payer, "Not payer");
        _;
    }
    modifier onlyPayee(uint256 escrowId) {
        require(msg.sender == escrows[escrowId].payee, "Not payee");
        _;
    }
    modifier escrowExists(uint256 escrowId) {
        require(escrowId < escrowCount, "No such escrow");
        _;
    }

    // --- Escrow Creation ---

    function createEscrow(
        address payee,
        address token,
        uint256 totalAmount,
        Milestone[] calldata milestones,
        address arbitrationPlugin,
        address conditionPlugin
    ) external payable returns (uint256 escrowId) {
        require(payee != address(0), "No payee");
        require(totalAmount > 0, "Zero amount");
        require(milestones.length > 0, "No milestones");
        require(arbitrationPlugin != address(0), "No arbitration plugin");

        escrowId = escrowCount++;
        Escrow storage e = escrows[escrowId];
        e.payer = msg.sender;
        e.payee = payee;
        e.token = IERC20(token);
        e.totalAmount = totalAmount;
        e.status = EscrowStatus.Open;
        e.arbitrationPlugin = arbitrationPlugin;
        e.conditionPlugin = conditionPlugin;
        e.createdAt = block.timestamp;

        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            e.milestones.push(Milestone({
                description: milestones[i].description,
                amount: milestones[i].amount,
                released: false,
                disputed: false
            }));
            sum += milestones[i].amount;
        }
        require(sum == totalAmount, "Milestone sum != total");

        // Fund escrow
        if (token == address(0)) {
            require(msg.value == totalAmount, "ETH amount mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), totalAmount), "ERC20 transfer failed");
        }

        emit EscrowCreated(escrowId, msg.sender, payee, token, totalAmount);
    }

    // --- Milestone Release ---

    function releaseMilestone(uint256 escrowId) external escrowExists(escrowId) onlyPayer(escrowId) {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Open || e.status == EscrowStatus.InProgress, "Escrow not active");
        require(e.currentMilestone < e.milestones.length, "All milestones done");
        Milestone storage ms = e.milestones[e.currentMilestone];
        require(!ms.released && !ms.disputed, "Already released/disputed");

        // Plugin-based programmable condition
        if (e.conditionPlugin != address(0)) {
            require(IConditionPlugin(e.conditionPlugin).isReleaseAllowed(escrowId), "Release not allowed");
        }

        ms.released = true;
        if (e.token == IERC20(address(0))) {
            payable(e.payee).transfer(ms.amount);
        } else {
            e.token.transfer(e.payee, ms.amount);
        }

        emit MilestoneReleased(escrowId, e.currentMilestone, e.payee, ms.amount);

        e.currentMilestone++;
        if (e.currentMilestone == e.milestones.length) {
            e.status = EscrowStatus.Completed;
            e.completedAt = block.timestamp;
        } else {
            e.status = EscrowStatus.InProgress;
        }
    }

    // --- Dispute/Arbitration ---

    function raiseDispute(uint256 escrowId) external escrowExists(escrowId) {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Open || e.status == EscrowStatus.InProgress, "Not disputable");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not party");
        Milestone storage ms = e.milestones[e.currentMilestone];
        require(!ms.released && !ms.disputed, "Already released/disputed");
        ms.disputed = true;
        e.status = EscrowStatus.Dispute;
        IArbitrationPlugin(e.arbitrationPlugin).requestArbitration(escrowId, msg.sender);
        emit EscrowDisputed(escrowId, e.currentMilestone, msg.sender);
    }

    function resolveDispute(uint256 escrowId, bool releaseToPayee) external escrowExists(escrowId) {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.arbitrationPlugin, "Not arbitrator");
        Milestone storage ms = e.milestones[e.currentMilestone];
        require(ms.disputed && !ms.released, "Not in dispute");
        ms.disputed = false;
        if (releaseToPayee) {
            ms.released = true;
            if (e.token == IERC20(address(0))) {
                payable(e.payee).transfer(ms.amount);
            } else {
                e.token.transfer(e.payee, ms.amount);
            }
            emit EscrowResolved(escrowId, e.currentMilestone, true);
        } else {
            // Refund to payer
            if (e.token == IERC20(address(0))) {
                payable(e.payer).transfer(ms.amount);
            } else {
                e.token.transfer(e.payer, ms.amount);
            }
            emit EscrowResolved(escrowId, e.currentMilestone, false);
        }
        e.currentMilestone++;
        if (e.currentMilestone == e.milestones.length) {
            e.status = EscrowStatus.Completed;
            e.completedAt = block.timestamp;
        } else {
            e.status = EscrowStatus.InProgress;
        }
    }

    // --- Cancel Escrow (if not started) ---

    function cancelEscrow(uint256 escrowId) external escrowExists(escrowId) onlyPayer(escrowId) {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Open, "Already started");
        e.status = EscrowStatus.Cancelled;
        if (address(e.token) == address(0)) {
            payable(e.payer).transfer(e.totalAmount);
        } else {
            e.token.transfer(e.payer, e.totalAmount);
        }
        emit EscrowCancelled(escrowId);
    }

    // --- View Functions ---

    function getEscrow(uint256 escrowId) external view escrowExists(escrowId) returns (
        address payer,
        address payee,
        address token,
        uint256 totalAmount,
        EscrowStatus status,
        uint256 currentMilestone,
        uint256 milestoneCount,
        address arbitrationPlugin,
        address conditionPlugin,
        uint256 createdAt,
        uint256 completedAt
    ) {
        Escrow storage e = escrows[escrowId];
        return (
            e.payer,
            e.payee,
            address(e.token),
            e.totalAmount,
            e.status,
            e.currentMilestone,
            e.milestones.length,
            e.arbitrationPlugin,
            e.conditionPlugin,
            e.createdAt,
            e.completedAt
        );
    }

    function getMilestone(uint256 escrowId, uint256 milestoneId) external view escrowExists(escrowId) returns (
        string memory description,
        uint256 amount,
        bool released,
        bool disputed
    ) {
        Milestone storage ms = escrows[escrowId].milestones[milestoneId];
        return (ms.description, ms.amount, ms.released, ms.disputed);
    }
}
