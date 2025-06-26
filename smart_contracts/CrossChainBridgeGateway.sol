// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title CrossChainBridgeGateway
/// @notice Modular, unstoppable, plugin-based cross-chain bridge for ERC20/ERC721/native assets & arbitrary messages. Fee programmable, permissionless, supports oracles/zk/relayer plugins, DAO/appchain/L2 ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IVerificationPlugin {
    function verifyProof(bytes calldata proof, bytes32 txHash, uint256 srcChainId) external view returns (bool);
}

interface IFeePlugin {
    function getFee(address sender, uint256 dstChainId, address token, uint256 amount) external view returns (uint256);
}

contract CrossChainBridgeGateway is Ownable {
    enum AssetType { Native, ERC20, ERC721 }

    struct BridgeRequest {
        address sender;
        address recipient;
        AssetType assetType;
        address asset;
        uint256 amountOrTokenId;
        uint256 dstChainId;
        uint256 srcChainId;
        bytes32 txHash;
        uint256 feePaid;
        uint256 createdAt;
        bool completed;
    }

    uint256 public requestCount;
    mapping(uint256 => BridgeRequest) public requests;
    mapping(bytes32 => bool) public processedTxHash;

    address public verificationPlugin;
    address public feePlugin;

    event BridgeRequested(
        uint256 indexed requestId,
        address indexed sender,
        address indexed recipient,
        AssetType assetType,
        address asset,
        uint256 amountOrTokenId,
        uint256 dstChainId,
        uint256 feePaid
    );
    event BridgeCompleted(
        uint256 indexed requestId,
        address recipient,
        AssetType assetType,
        address asset,
        uint256 amountOrTokenId,
        uint256 srcChainId,
        bytes32 srcTxHash
    );
    event VerificationPluginSet(address plugin);
    event FeePluginSet(address plugin);

    // --- Plugin Management ---

    function setVerificationPlugin(address plugin) external onlyOwner {
        verificationPlugin = plugin;
        emit VerificationPluginSet(plugin);
    }

    function setFeePlugin(address plugin) external onlyOwner {
        feePlugin = plugin;
        emit FeePluginSet(plugin);
    }

    // --- Bridge Request Initiation (Lock/Burn) ---

    function bridgeNative(
        address recipient,
        uint256 dstChainId
    ) external payable returns (uint256 requestId) {
        require(msg.value > 0, "No value sent");
        uint256 fee = _getFee(msg.sender, dstChainId, address(0), msg.value);
        require(msg.value > fee, "Insufficient for fee");
        requestId = requestCount++;
        requests[requestId] = BridgeRequest({
            sender: msg.sender,
            recipient: recipient,
            assetType: AssetType.Native,
            asset: address(0),
            amountOrTokenId: msg.value - fee,
            dstChainId: dstChainId,
            srcChainId: block.chainid,
            txHash: 0,
            feePaid: fee,
            createdAt: block.timestamp,
            completed: false
        });
        // Fee sent to owner
        payable(owner()).transfer(fee);
        emit BridgeRequested(requestId, msg.sender, recipient, AssetType.Native, address(0), msg.value - fee, dstChainId, fee);
    }

    function bridgeERC20(
        address token,
        uint256 amount,
        address recipient,
        uint256 dstChainId
    ) external returns (uint256 requestId) {
        require(amount > 0, "Zero amount");
        uint256 fee = _getFee(msg.sender, dstChainId, token, amount);
        IERC20(token).transferFrom(msg.sender, address(this), amount + fee);
        requestId = requestCount++;
        requests[requestId] = BridgeRequest({
            sender: msg.sender,
            recipient: recipient,
            assetType: AssetType.ERC20,
            asset: token,
            amountOrTokenId: amount,
            dstChainId: dstChainId,
            srcChainId: block.chainid,
            txHash: 0,
            feePaid: fee,
            createdAt: block.timestamp,
            completed: false
        });
        IERC20(token).transfer(owner(), fee);
        emit BridgeRequested(requestId, msg.sender, recipient, AssetType.ERC20, token, amount, dstChainId, fee);
    }

    function bridgeERC721(
        address token,
        uint256 tokenId,
        address recipient,
        uint256 dstChainId
    ) external returns (uint256 requestId) {
        IERC721(token).transferFrom(msg.sender, address(this), tokenId);
        uint256 fee = _getFee(msg.sender, dstChainId, token, 1);
        requestId = requestCount++;
        requests[requestId] = BridgeRequest({
            sender: msg.sender,
            recipient: recipient,
            assetType: AssetType.ERC721,
            asset: token,
            amountOrTokenId: tokenId,
            dstChainId: dstChainId,
            srcChainId: block.chainid,
            txHash: 0,
            feePaid: fee,
            createdAt: block.timestamp,
            completed: false
        });
        if (fee > 0) {
            IERC20(token).transfer(owner(), fee); // Fee in ERC721 token (optional, plugin may require)
        }
        emit BridgeRequested(requestId, msg.sender, recipient, AssetType.ERC721, token, tokenId, dstChainId, fee);
    }

    // --- Bridge Completion (Unlock/Mint) ---

    function completeBridge(
        uint256 requestId,
        address recipient,
        AssetType assetType,
        address asset,
        uint256 amountOrTokenId,
        uint256 srcChainId,
        bytes32 srcTxHash,
        bytes calldata proof
    ) external {
        require(verificationPlugin != address(0), "No verification plugin");
        require(!processedTxHash[srcTxHash], "Already processed");
        require(IVerificationPlugin(verificationPlugin).verifyProof(proof, srcTxHash, srcChainId), "Invalid proof");
        processedTxHash[srcTxHash] = true;

        // Release or mint asset
        if (assetType == AssetType.Native) {
            payable(recipient).transfer(amountOrTokenId);
        } else if (assetType == AssetType.ERC20) {
            IERC20(asset).transfer(recipient, amountOrTokenId);
        } else if (assetType == AssetType.ERC721) {
            IERC721(asset).transferFrom(address(this), recipient, amountOrTokenId);
        }
        requests[requestId].completed = true;
        requests[requestId].txHash = srcTxHash;
        emit BridgeCompleted(requestId, recipient, assetType, asset, amountOrTokenId, srcChainId, srcTxHash);
    }

    // --- Fee Calculation (Plugin-based) ---

    function _getFee(address sender, uint256 dstChainId, address token, uint256 amount) internal view returns (uint256) {
        if (feePlugin != address(0)) {
            return IFeePlugin(feePlugin).getFee(sender, dstChainId, token, amount);
        }
        return 0;
    }

    // --- View Functions ---

    function getRequest(uint256 requestId) external view returns (
        address sender,
        address recipient,
        AssetType assetType,
        address asset,
        uint256 amountOrTokenId,
        uint256 dstChainId,
        uint256 srcChainId,
        bytes32 txHash,
        uint256 feePaid,
        uint256 createdAt,
        bool completed
    ) {
        BridgeRequest storage r = requests[requestId];
        return (
            r.sender,
            r.recipient,
            r.assetType,
            r.asset,
            r.amountOrTokenId,
            r.dstChainId,
            r.srcChainId,
            r.txHash,
            r.feePaid,
            r.createdAt,
            r.completed
        );
    }
}
