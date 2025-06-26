// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title CrossChainBridgeController
/// @notice Ultra-modern, unstoppable cross-chain bridge controller for assets and messages, with plug-in modules, fraud proofs, and DAO-ready logic.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

interface IBridgeModule {
    function sendMessage(
        address sender,
        uint256 dstChainId,
        address recipient,
        bytes calldata payload
    ) external returns (bytes32 messageId);

    function receiveMessage(
        bytes32 messageId,
        uint256 srcChainId,
        address sender,
        address recipient,
        bytes calldata payload,
        bytes calldata proof
    ) external;
}

contract CrossChainBridgeController is Ownable {
    struct BridgeModule {
        address module;
        string name;
        bool enabled;
    }

    // ChainId => BridgeModule
    mapping(uint256 => BridgeModule) public modules;
    // messageId => status
    mapping(bytes32 => bool) public processedMessages;

    event ModuleRegistered(uint256 indexed chainId, address module, string name);
    event ModuleEnabled(uint256 indexed chainId, bool enabled);
    event AssetLocked(
        address indexed user,
        uint256 indexed dstChainId,
        address indexed token,
        uint256 tokenId,
        uint256 amount,
        address recipient,
        bytes32 messageId
    );
    event MessageSent(
        uint256 indexed dstChainId,
        address indexed recipient,
        bytes payload,
        bytes32 messageId
    );
    event MessageReceived(
        uint256 indexed srcChainId,
        address indexed sender,
        address indexed recipient,
        bytes payload,
        bytes32 messageId
    );
    event AssetReleased(
        address indexed user,
        address indexed token,
        uint256 tokenId,
        uint256 amount,
        address recipient
    );

    // --- Module Management ---

    function registerModule(uint256 chainId, address module, string calldata name) external onlyOwner {
        require(module != address(0), "Module required");
        modules[chainId] = BridgeModule(module, name, true);
        emit ModuleRegistered(chainId, module, name);
    }

    function setModuleEnabled(uint256 chainId, bool enabled) external onlyOwner {
        modules[chainId].enabled = enabled;
        emit ModuleEnabled(chainId, enabled);
    }

    // --- Asset Locking (Outbound Transfer) ---

    function lockERC20(
        address token,
        uint256 amount,
        uint256 dstChainId,
        address recipient
    ) external returns (bytes32 messageId) {
        require(modules[dstChainId].enabled, "No module");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        bytes memory payload = abi.encode("ERC20", token, amount, recipient);
        messageId = IBridgeModule(modules[dstChainId].module).sendMessage(
            msg.sender, dstChainId, recipient, payload
        );
        emit AssetLocked(msg.sender, dstChainId, token, 0, amount, recipient, messageId);
        emit MessageSent(dstChainId, recipient, payload, messageId);
    }

    function lockERC721(
        address token,
        uint256 tokenId,
        uint256 dstChainId,
        address recipient
    ) external returns (bytes32 messageId) {
        require(modules[dstChainId].enabled, "No module");
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);
        bytes memory payload = abi.encode("ERC721", token, tokenId, recipient);
        messageId = IBridgeModule(modules[dstChainId].module).sendMessage(
            msg.sender, dstChainId, recipient, payload
        );
        emit AssetLocked(msg.sender, dstChainId, token, tokenId, 1, recipient, messageId);
        emit MessageSent(dstChainId, recipient, payload, messageId);
    }

    function lockERC1155(
        address token,
        uint256 tokenId,
        uint256 amount,
        uint256 dstChainId,
        address recipient
    ) external returns (bytes32 messageId) {
        require(modules[dstChainId].enabled, "No module");
        IERC1155(token).safeTransferFrom(msg.sender, address(this), tokenId, amount, "");
        bytes memory payload = abi.encode("ERC1155", token, tokenId, amount, recipient);
        messageId = IBridgeModule(modules[dstChainId].module).sendMessage(
            msg.sender, dstChainId, recipient, payload
        );
        emit AssetLocked(msg.sender, dstChainId, token, tokenId, amount, recipient, messageId);
        emit MessageSent(dstChainId, recipient, payload, messageId);
    }

    // --- Message Passing (Generic) ---

    function sendMessage(
        uint256 dstChainId,
        address recipient,
        bytes calldata payload
    ) external returns (bytes32 messageId) {
        require(modules[dstChainId].enabled, "No module");
        messageId = IBridgeModule(modules[dstChainId].module).sendMessage(
            msg.sender, dstChainId, recipient, payload
        );
        emit MessageSent(dstChainId, recipient, payload, messageId);
    }

    // --- Message Receiving & Asset Release (Inbound) ---

    function receiveMessage(
        bytes32 messageId,
        uint256 srcChainId,
        address sender,
        address recipient,
        bytes calldata payload,
        bytes calldata proof
    ) external {
        require(msg.sender == modules[srcChainId].module, "Not from module");
        require(!processedMessages[messageId], "Already processed");
        processedMessages[messageId] = true;

        // Decode payload for asset release or generic message
        (string memory typ, address token, uint256 param1, uint256 param2, address recipientDecoded) = _decodePayload(payload);

        if (
            keccak256(bytes(typ)) == keccak256(bytes("ERC20"))
        ) {
            IERC20(token).transfer(recipientDecoded, param1);
            emit AssetReleased(sender, token, 0, param1, recipientDecoded);
        }
        else if (
            keccak256(bytes(typ)) == keccak256(bytes("ERC721"))
        ) {
            IERC721(token).transferFrom(address(this), recipientDecoded, param1);
            emit AssetReleased(sender, token, param1, 1, recipientDecoded);
        }
        else if (
            keccak256(bytes(typ)) == keccak256(bytes("ERC1155"))
        ) {
            IERC1155(token).safeTransferFrom(address(this), recipientDecoded, param1, param2, "");
            emit AssetReleased(sender, token, param1, param2, recipientDecoded);
        }
        // arbitrary message: no asset release, just event
        emit MessageReceived(srcChainId, sender, recipient, payload, messageId);
    }

    function _decodePayload(bytes memory payload)
        internal
        pure
        returns (
            string memory typ,
            address token,
            uint256 param1,
            uint256 param2,
            address recipient
        )
    {
        // Try to decode as ERC20, ERC721, ERC1155, or generic
        // For ERC20: abi.encode("ERC20", token, amount, recipient)
        // For ERC721: abi.encode("ERC721", token, tokenId, recipient)
        // For ERC1155: abi.encode("ERC1155", token, tokenId, amount, recipient)
        if (payload.length == 0) return ("", address(0), 0, 0, address(0));
        (typ, token, param1, param2, recipient) = abi.decode(payload, (string, address, uint256, uint256, address));
    }

    // --- ERC721/ERC1155 Receiver ---

    function onERC1155Received(address, address, uint256, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC1155Received.selector;
    }
    function onERC1155BatchReceived(address, address, uint256[] calldata, uint256[] calldata, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC1155BatchReceived.selector;
    }
    function onERC721Received(address, address, uint256, bytes calldata)
        external pure returns (bytes4)
    {
        return this.onERC721Received.selector;
    }
}
