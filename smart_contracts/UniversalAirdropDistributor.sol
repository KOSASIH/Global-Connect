// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalAirdropDistributor
/// @notice Modular, unstoppable, plugin-based airdrop distributor for ERC20, ERC721, and native tokens. Supports Merkle/proof plugins, multi-asset, DAO/protocol/NFT/community ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IClaimPlugin {
    function isEligible(uint256 dropId, address claimant, uint256 amountOrTokenId, bytes calldata proof) external view returns (bool);
}

contract UniversalAirdropDistributor is Ownable {
    enum AssetType { Native, ERC20, ERC721 }

    struct Drop {
        AssetType assetType;
        address asset;
        uint256 totalAmountOrCount;
        address claimPlugin;
        uint256 start;
        uint256 end;
        bool active;
        string metadataURI;
        uint256 claimedCount;
    }

    uint256 public dropCount;
    mapping(uint256 => Drop) public drops;
    mapping(uint256 => mapping(address => bool)) public hasClaimed; // dropId => user => claimed

    event DropCreated(
        uint256 indexed dropId,
        AssetType assetType,
        address asset,
        uint256 totalAmountOrCount,
        address claimPlugin,
        uint256 start,
        uint256 end,
        string metadataURI
    );
    event Claimed(
        uint256 indexed dropId,
        address indexed claimant,
        AssetType assetType,
        address asset,
        uint256 amountOrTokenId
    );
    event DropDeactivated(uint256 indexed dropId);

    // --- Create Drop ---

    function createDrop(
        AssetType assetType,
        address asset,
        uint256 totalAmountOrCount,
        address claimPlugin,
        uint256 start,
        uint256 end,
        string calldata metadataURI
    ) external payable onlyOwner returns (uint256 dropId) {
        require(end > start && start >= block.timestamp, "Invalid time");
        require(claimPlugin != address(0), "No claim plugin");
        require(totalAmountOrCount > 0, "Zero amount");
        dropId = dropCount++;
        Drop storage d = drops[dropId];
        d.assetType = assetType;
        d.asset = asset;
        d.totalAmountOrCount = totalAmountOrCount;
        d.claimPlugin = claimPlugin;
        d.start = start;
        d.end = end;
        d.active = true;
        d.metadataURI = metadataURI;

        // Transfer funds/tokens/NFTs into contract
        if (assetType == AssetType.Native) {
            require(msg.value == totalAmountOrCount, "ETH mismatch");
        } else if (assetType == AssetType.ERC20) {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(asset).transferFrom(msg.sender, address(this), totalAmountOrCount), "ERC20 transfer failed");
        }
        // For ERC721, tokens must be transferred individually before claim

        emit DropCreated(dropId, assetType, asset, totalAmountOrCount, claimPlugin, start, end, metadataURI);
    }

    // --- Claim ---

    function claim(
        uint256 dropId,
        uint256 amountOrTokenId,
        bytes calldata proof
    ) external {
        Drop storage d = drops[dropId];
        require(d.active, "Inactive drop");
        require(block.timestamp >= d.start && block.timestamp <= d.end, "Not claimable");
        require(!hasClaimed[dropId][msg.sender], "Already claimed");
        require(IClaimPlugin(d.claimPlugin).isEligible(dropId, msg.sender, amountOrTokenId, proof), "Not eligible");

        hasClaimed[dropId][msg.sender] = true;
        d.claimedCount += 1;

        if (d.assetType == AssetType.Native) {
            payable(msg.sender).transfer(amountOrTokenId);
        } else if (d.assetType == AssetType.ERC20) {
            IERC20(d.asset).transfer(msg.sender, amountOrTokenId);
        } else if (d.assetType == AssetType.ERC721) {
            IERC721(d.asset).transferFrom(address(this), msg.sender, amountOrTokenId);
        }

        emit Claimed(dropId, msg.sender, d.assetType, d.asset, amountOrTokenId);
    }

    // --- Deactivate Drop (emergency or finished) ---

    function deactivateDrop(uint256 dropId) external onlyOwner {
        drops[dropId].active = false;
        emit DropDeactivated(dropId);
    }

    // --- View ---

    function getDrop(uint256 dropId) external view returns (
        AssetType assetType,
        address asset,
        uint256 totalAmountOrCount,
        address claimPlugin,
        uint256 start,
        uint256 end,
        bool active,
        string memory metadataURI,
        uint256 claimedCount
    ) {
        Drop storage d = drops[dropId];
        return (
            d.assetType,
            d.asset,
            d.totalAmountOrCount,
            d.claimPlugin,
            d.start,
            d.end,
            d.active,
            d.metadataURI,
            d.claimedCount
        );
    }

    function isClaimed(uint256 dropId, address user) external view returns (bool) {
        return hasClaimed[dropId][user];
    }
}
