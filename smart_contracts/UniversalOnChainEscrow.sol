// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainEscrow
/// @notice Modular, unstoppable, plugin-based escrow for ERC20, ERC721, and native assets. Dispute plugins (arbitration, DAO, oracle), milestones, programmable release. Protocol/DAO/marketplace ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IDisputePlugin {
    function resolve(uint256 escrowId, address buyer, address seller, uint256 amountOrTokenId, bytes calldata data) external returns (bool, uint256, uint256);
}

contract UniversalOnChainEscrow is Ownable {
    enum AssetType { Native, ERC20, ERC721 }
    enum EscrowStatus { Pending, Funded, Released, Cancelled, Disputed, Resolved }

    struct Milestone {
        string description;
        uint256 amountOrTokenId;
        bool released;
    }

    struct Escrow {
        address buyer;
        address seller;
        AssetType assetType;
        address asset;
        uint256 value; // Total amount or tokenId
        EscrowStatus status;
        address disputePlugin;
        Milestone[] milestones;
        uint256 milestonePointer;
        string metadataURI;
        uint256 createdAt;
    }

    uint256 public escrowCount;
    mapping(uint256 => Escrow) public escrows;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, AssetType assetType, address asset, uint256 value, address disputePlugin, string metadataURI);
    event EscrowFunded(uint256 indexed escrowId, uint256 value);
    event MilestoneReleased(uint256 indexed escrowId, uint256 milestoneId, uint256 amountOrTokenId);
    event EscrowStatusChanged(uint256 indexed escrowId, EscrowStatus status);
    event EscrowResolved(uint256 indexed escrowId, uint256 buyerShare, uint256 sellerShare);

    // --- Create Escrow ---

    function createEscrow(
        address seller,
        AssetType assetType,
        address asset,
        uint256 value,
        Milestone[] calldata milestones,
        address disputePlugin,
        string calldata metadataURI
    ) external payable returns (uint256 escrowId) {
        require(seller != address(0), "No seller");
        require(value > 0, "Zero value");
        require(milestones.length > 0, "No milestones");
        escrowId = escrowCount++;
        Escrow storage e = escrows[escrowId];
        e.buyer = msg.sender;
        e.seller = seller;
        e.assetType = assetType;
        e.asset = asset;
        e.value = value;
        e.status = EscrowStatus.Pending;
        e.disputePlugin = disputePlugin;
        e.metadataURI = metadataURI;
        e.createdAt = block.timestamp;
        uint256 sum;
        for (uint256 i = 0; i < milestones.length; i++) {
            e.milestones.push(Milestone({
                description: milestones[i].description,
                amountOrTokenId: milestones[i].amountOrTokenId,
                released: false
            }));
            sum += milestones[i].amountOrTokenId;
        }
        require(sum == value, "Milestones != value");
        emit EscrowCreated(escrowId, msg.sender, seller, assetType, asset, value, disputePlugin, metadataURI);
    }

    // --- Fund Escrow ---

    function fundEscrow(uint256 escrowId) external payable {
        Escrow storage e = escrows[escrowId];
        require(msg.sender == e.buyer, "Not buyer");
        require(e.status == EscrowStatus.Pending, "Not pending");
        if (e.assetType == AssetType.Native) {
            require(msg.value == e.value, "ETH mismatch");
        } else if (e.assetType == AssetType.ERC20) {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(e.asset).transferFrom(msg.sender, address(this), e.value), "ERC20 transfer failed");
        } else if (e.assetType == AssetType.ERC721) {
            require(msg.value == 0, "No ETH for ERC721");
            IERC721(e.asset).transferFrom(msg.sender, address(this), e.value);
        }
        e.status = EscrowStatus.Funded;
        emit EscrowFunded(escrowId, e.value);
        emit EscrowStatusChanged(escrowId, EscrowStatus.Funded);
    }

    // --- Milestone or Full Release ---

    function releaseMilestone(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not funded");
        require(msg.sender == e.buyer, "Not buyer");
        require(e.milestonePointer < e.milestones.length, "All released");
        Milestone storage m = e.milestones[e.milestonePointer];
        require(!m.released, "Already released");

        m.released = true;
        if (e.assetType == AssetType.Native) {
            payable(e.seller).transfer(m.amountOrTokenId);
        } else if (e.assetType == AssetType.ERC20) {
            IERC20(e.asset).transfer(e.seller, m.amountOrTokenId);
        } else if (e.assetType == AssetType.ERC721) {
            IERC721(e.asset).transferFrom(address(this), e.seller, m.amountOrTokenId);
        }
        e.milestonePointer += 1;

        emit MilestoneReleased(escrowId, e.milestonePointer - 1, m.amountOrTokenId);

        // Finalize if all released
        if (e.milestonePointer == e.milestones.length) {
            e.status = EscrowStatus.Released;
            emit EscrowStatusChanged(escrowId, EscrowStatus.Released);
        }
    }

    // --- Dispute & Resolve ---

    function dispute(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Funded, "Not funded");
        require(msg.sender == e.buyer || msg.sender == e.seller, "Not party");
        e.status = EscrowStatus.Disputed;
        emit EscrowStatusChanged(escrowId, EscrowStatus.Disputed);
    }

    function resolve(uint256 escrowId, bytes calldata pluginData) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Disputed, "Not disputed");
        require(e.disputePlugin != address(0), "No plugin");
        (bool resolved, uint256 buyerShare, uint256 sellerShare) =
            IDisputePlugin(e.disputePlugin).resolve(escrowId, e.buyer, e.seller, e.value, pluginData);
        require(resolved, "Not resolved");
        if (e.assetType == AssetType.Native) {
            if (buyerShare > 0) payable(e.buyer).transfer(buyerShare);
            if (sellerShare > 0) payable(e.seller).transfer(sellerShare);
        } else if (e.assetType == AssetType.ERC20) {
            if (buyerShare > 0) IERC20(e.asset).transfer(e.buyer, buyerShare);
            if (sellerShare > 0) IERC20(e.asset).transfer(e.seller, sellerShare);
        } else if (e.assetType == AssetType.ERC721) {
            // Only one token, transfer to winner (buyerShare > 0 means buyer wins)
            if (buyerShare > 0) {
                IERC721(e.asset).transferFrom(address(this), e.buyer, e.value);
            } else if (sellerShare > 0) {
                IERC721(e.asset).transferFrom(address(this), e.seller, e.value);
            }
        }
        e.status = EscrowStatus.Resolved;
        emit EscrowResolved(escrowId, buyerShare, sellerShare);
        emit EscrowStatusChanged(escrowId, EscrowStatus.Resolved);
    }

    // --- Cancel ---

    function cancel(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Pending, "Not pending");
        require(msg.sender == e.buyer, "Not buyer");
        e.status = EscrowStatus.Cancelled;
        emit EscrowStatusChanged(escrowId, EscrowStatus.Cancelled);
    }

    // --- View ---

    function getEscrow(uint256 escrowId) external view returns (
        address buyer,
        address seller,
        AssetType assetType,
        address asset,
        uint256 value,
        EscrowStatus status,
        address disputePlugin,
        uint256 milestoneCount,
        uint256 milestonePointer,
        string memory metadataURI,
        uint256 createdAt
    ) {
        Escrow storage e = escrows[escrowId];
        return (
            e.buyer,
            e.seller,
            e.assetType,
            e.asset,
            e.value,
            e.status,
            e.disputePlugin,
            e.milestones.length,
            e.milestonePointer,
            e.metadataURI,
            e.createdAt
        );
    }

    function getMilestone(uint256 escrowId, uint256 milestoneId) external view returns (
        string memory description,
        uint256 amountOrTokenId,
        bool released
    ) {
        Milestone storage m = escrows[escrowId].milestones[milestoneId];
        return (m.description, m.amountOrTokenId, m.released);
    }
}
