// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title NFTComposabilityEngine
/// @notice Advanced NFT engine for composability, fusion, upgrades, splits, and trait inheritance. ERC-721A and ERC-1155 compatible.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTComposabilityEngine is ERC721Enumerable, Ownable {
    struct Trait {
        string traitType;
        string value;
    }

    struct NFTMetadata {
        Trait[] traits;
        uint256 fusionLevel;
        uint256 parent1;
        uint256 parent2;
        bool exists;
    }

    uint256 public nextTokenId;
    mapping(uint256 => NFTMetadata) public nftData;
    mapping(address => bool) public minters;
    bool public permissionlessMinting;

    event NFTMinted(address indexed to, uint256 indexed tokenId);
    event NFTFused(address indexed owner, uint256 parent1, uint256 parent2, uint256 newTokenId);
    event NFTSplit(address indexed owner, uint256 fusedTokenId, uint256 child1, uint256 child2);
    event TraitUpgraded(uint256 indexed tokenId, string traitType, string newValue);
    event PermissionlessMintingChanged(bool enabled);
    event MinterUpdated(address indexed minter, bool enabled);

    modifier onlyMinter() {
        require(minters[msg.sender] || permissionlessMinting || msg.sender == owner(), "Not minter");
        _;
    }

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {
        nextTokenId = 1;
        minters[msg.sender] = true;
    }

    // --- Minting ---

    function mint(address to, Trait[] memory traits) public onlyMinter returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        _safeMint(to, tokenId);

        NFTMetadata storage meta = nftData[tokenId];
        meta.exists = true;
        for (uint256 i = 0; i < traits.length; i++) {
            meta.traits.push(traits[i]);
        }
        emit NFTMinted(to, tokenId);
    }

    function setPermissionlessMinting(bool enabled) external onlyOwner {
        permissionlessMinting = enabled;
        emit PermissionlessMintingChanged(enabled);
    }

    function setMinter(address minter, bool enabled) external onlyOwner {
        minters[minter] = enabled;
        emit MinterUpdated(minter, enabled);
    }

    // --- Fusion ---

    function fuse(uint256 tokenId1, uint256 tokenId2) external returns (uint256 newTokenId) {
        require(ownerOf(tokenId1) == msg.sender && ownerOf(tokenId2) == msg.sender, "Not owner");
        require(tokenId1 != tokenId2, "Cannot fuse same NFT");
        require(nftData[tokenId1].exists && nftData[tokenId2].exists, "NFT does not exist");

        // Burn originals (transfer to address 0)
        _burn(tokenId1);
        _burn(tokenId2);

        // Mint new fused NFT
        newTokenId = nextTokenId++;
        _safeMint(msg.sender, newTokenId);

        NFTMetadata storage meta = nftData[newTokenId];
        meta.exists = true;
        meta.parent1 = tokenId1;
        meta.parent2 = tokenId2;
        meta.fusionLevel = _max(nftData[tokenId1].fusionLevel, nftData[tokenId2].fusionLevel) + 1;
        // Inherit and combine traits (simple merge, can be made more complex)
        for (uint256 i = 0; i < nftData[tokenId1].traits.length; i++) {
            meta.traits.push(nftData[tokenId1].traits[i]);
        }
        for (uint256 i = 0; i < nftData[tokenId2].traits.length; i++) {
            meta.traits.push(nftData[tokenId2].traits[i]);
        }
        emit NFTFused(msg.sender, tokenId1, tokenId2, newTokenId);
    }

    // --- Split (reverse fusion) ---

    function split(uint256 fusedTokenId) external returns (uint256 child1, uint256 child2) {
        require(ownerOf(fusedTokenId) == msg.sender, "Not owner");
        NFTMetadata storage meta = nftData[fusedTokenId];
        require(meta.exists, "NFT does not exist");
        require(meta.parent1 != 0 && meta.parent2 != 0, "Not a fused NFT");

        // Burn fused NFT
        _burn(fusedTokenId);

        // Re-mint original NFTs (traits can be inherited or reset)
        child1 = nextTokenId++;
        child2 = nextTokenId++;
        _safeMint(msg.sender, child1);
        _safeMint(msg.sender, child2);

        NFTMetadata storage meta1 = nftData[child1];
        meta1.exists = true;
        meta1.traits = nftData[meta.parent1].traits;
        meta1.fusionLevel = nftData[meta.parent1].fusionLevel;
        meta1.parent1 = nftData[meta.parent1].parent1;
        meta1.parent2 = nftData[meta.parent1].parent2;

        NFTMetadata storage meta2 = nftData[child2];
        meta2.exists = true;
        meta2.traits = nftData[meta.parent2].traits;
        meta2.fusionLevel = nftData[meta.parent2].fusionLevel;
        meta2.parent1 = nftData[meta.parent2].parent1;
        meta2.parent2 = nftData[meta.parent2].parent2;

        emit NFTSplit(msg.sender, fusedTokenId, child1, child2);
    }

    // --- Trait Upgrades ---

    function upgradeTrait(uint256 tokenId, string memory traitType, string memory newValue) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        NFTMetadata storage meta = nftData[tokenId];
        bool found = false;
        for (uint256 i = 0; i < meta.traits.length; i++) {
            if (keccak256(bytes(meta.traits[i].traitType)) == keccak256(bytes(traitType))) {
                meta.traits[i].value = newValue;
                found = true;
                break;
            }
        }
        // If not found, add new trait
        if (!found) {
            meta.traits.push(Trait({traitType: traitType, value: newValue}));
        }
        emit TraitUpgraded(tokenId, traitType, newValue);
    }

    // --- View functions ---

    function getTraits(uint256 tokenId) external view returns (Trait[] memory) {
        require(nftData[tokenId].exists, "NFT does not exist");
        return nftData[tokenId].traits;
    }

    function getFusionLevel(uint256 tokenId) external view returns (uint256) {
        require(nftData[tokenId].exists, "NFT does not exist");
        return nftData[tokenId].fusionLevel;
    }

    function getParentTokens(uint256 tokenId) external view returns (uint256, uint256) {
        require(nftData[tokenId].exists, "NFT does not exist");
        return (nftData[tokenId].parent1, nftData[tokenId].parent2);
    }

    // --- Internal helpers ---

    function _max(uint256 a, uint256 b) private pure returns (uint256) {
        return a >= b ? a : b;
    }
}
