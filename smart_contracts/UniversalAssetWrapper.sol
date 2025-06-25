// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalAssetWrapper
/// @notice High-tech, unstoppable wrapper for ERC20, ERC721, ERC1155; enables composability, batch actions, and universal DeFi/NFT asset logic.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UniversalAssetWrapper is Ownable, ERC1155Receiver, IERC721Receiver, ERC165 {
    enum AssetType { ERC20, ERC721, ERC1155 }

    struct Asset {
        AssetType assetType;
        address tokenAddress;
        uint256 tokenId; // for ERC721/ERC1155
        uint256 amount;  // for ERC20/ERC1155
        address owner;
        uint256 wrappedId;
        bool exists;
    }

    uint256 public nextWrappedId;
    mapping(uint256 => Asset) public wrappedAssets; // wrappedId => Asset
    mapping(address => uint256[]) public userWrappedAssets; // user => wrappedIds

    event AssetWrapped(
        address indexed user,
        uint256 indexed wrappedId,
        AssetType assetType,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount
    );
    event AssetUnwrapped(
        address indexed user,
        uint256 indexed wrappedId
    );
    event BatchWrapped(address indexed user, uint256[] wrappedIds);

    // --- ERC165 support ---
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC165, ERC1155Receiver) returns (bool) {
        return
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC721Receiver).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    // --- Deposit/Wrap ---

    function wrapERC20(address token, uint256 amount) external returns (uint256 wrappedId) {
        require(amount > 0, "Zero amount");
        require(token != address(0), "Zero token");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        wrappedId = _mintWrapped(AssetType.ERC20, token, 0, amount, msg.sender);
    }

    function wrapERC721(address token, uint256 tokenId) external returns (uint256 wrappedId) {
        require(token != address(0), "Zero token");
        IERC721(token).safeTransferFrom(msg.sender, address(this), tokenId);
        wrappedId = _mintWrapped(AssetType.ERC721, token, tokenId, 1, msg.sender);
    }

    function wrapERC1155(address token, uint256 tokenId, uint256 amount) external returns (uint256 wrappedId) {
        require(amount > 0, "Zero amount");
        require(token != address(0), "Zero token");
        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        wrappedId = _mintWrapped(AssetType.ERC1155, token, tokenId, amount, msg.sender);
    }

    function batchWrapERC20(address[] calldata tokens, uint256[] calldata amounts) external returns (uint256[] memory wrappedIds) {
        require(tokens.length == amounts.length, "Length mismatch");
        wrappedIds = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            wrappedIds[i] = wrapERC20(tokens[i], amounts[i]);
        }
        emit BatchWrapped(msg.sender, wrappedIds);
    }

    function batchWrapERC721(address[] calldata tokens, uint256[] calldata tokenIds) external returns (uint256[] memory wrappedIds) {
        require(tokens.length == tokenIds.length, "Length mismatch");
        wrappedIds = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            wrappedIds[i] = wrapERC721(tokens[i], tokenIds[i]);
        }
        emit BatchWrapped(msg.sender, wrappedIds);
    }

    function batchWrapERC1155(address[] calldata tokens, uint256[] calldata tokenIds, uint256[] calldata amounts) external returns (uint256[] memory wrappedIds) {
        require(tokens.length == tokenIds.length && tokens.length == amounts.length, "Length mismatch");
        wrappedIds = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            wrappedIds[i] = wrapERC1155(tokens[i], tokenIds[i], amounts[i]);
        }
        emit BatchWrapped(msg.sender, wrappedIds);
    }

    function _mintWrapped(
        AssetType assetType,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        address owner
    ) internal returns (uint256 wrappedId) {
        wrappedId = nextWrappedId++;
        wrappedAssets[wrappedId] = Asset(assetType, tokenAddress, tokenId, amount, owner, wrappedId, true);
        userWrappedAssets[owner].push(wrappedId);
        emit AssetWrapped(owner, wrappedId, assetType, tokenAddress, tokenId, amount);
    }

    // --- Withdraw/Unwrap ---

    function unwrap(uint256 wrappedId) external {
        Asset storage asset = wrappedAssets[wrappedId];
        require(asset.exists, "Not exist");
        require(asset.owner == msg.sender, "Not owner");
        asset.exists = false;
        if (asset.assetType == AssetType.ERC20) {
            IERC20(asset.tokenAddress).transfer(msg.sender, asset.amount);
        } else if (asset.assetType == AssetType.ERC721) {
            IERC721(asset.tokenAddress).safeTransferFrom(address(this), msg.sender, asset.tokenId);
        } else if (asset.assetType == AssetType.ERC1155) {
            IERC1155(asset.tokenAddress).safeTransferFrom(address(this), msg.sender, asset.tokenId, asset.amount, "");
        }
        emit AssetUnwrapped(msg.sender, wrappedId);
    }

    // --- Meta-transaction ready (optional plugins/hooks) ---

    // Placeholder for plugin/hook logic, e.g. composable DeFi, governance, etc.

    // --- View Functions ---

    function getWrappedAsset(uint256 wrappedId) external view returns (
        AssetType assetType,
        address tokenAddress,
        uint256 tokenId,
        uint256 amount,
        address owner,
        bool exists
    ) {
        Asset storage asset = wrappedAssets[wrappedId];
        return (asset.assetType, asset.tokenAddress, asset.tokenId, asset.amount, asset.owner, asset.exists);
    }

    function getUserWrappedAssets(address user) external view returns (uint256[] memory) {
        return userWrappedAssets[user];
    }

    // --- ERC721/ERC1155 Receiver implementations ---

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function onERC1155Received(address, address, uint256, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
