// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title CrossChainBridgeHub
/// @notice Enterprise-grade cross-chain bridge hub for assets, NFTs, and arbitrary messages.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IBridgeAdapter {
    function deposit(
        address sender,
        address receiver,
        uint256 amount,
        uint256 targetChainId,
        bytes calldata extraData
    ) external payable;

    function withdraw(
        address receiver,
        uint256 amount,
        uint256 sourceChainId,
        bytes calldata extraData
    ) external;
}

contract CrossChainBridgeHub {
    // --- EVENTS ---
    event DepositInitiated(
        uint256 indexed nonce,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 targetChainId,
        address adapter,
        bytes extraData
    );
    event WithdrawalFinalized(
        uint256 indexed nonce,
        address indexed receiver,
        uint256 amount,
        uint256 sourceChainId,
        address adapter,
        bytes extraData
    );
    event AdapterRegistered(uint256 chainId, address adapter);
    event AdapterRemoved(uint256 chainId);
    event Paused(address by);
    event Unpaused(address by);

    // --- STORAGE ---
    address public owner;
    bool public paused;
    uint256 public nonce;
    mapping(uint256 => address) public adapters; // chainId => adapter
    mapping(bytes32 => bool) public processedNonces; // prevent replay attacks

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    modifier notPaused() {
        require(!paused, "Bridge is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        paused = false;
        nonce = 0;
    }

    // --- ADMIN CONTROLS ---
    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        owner = newOwner;
    }

    function registerAdapter(uint256 chainId, address adapter) external onlyOwner {
        require(adapter != address(0), "Invalid adapter");
        adapters[chainId] = adapter;
        emit AdapterRegistered(chainId, adapter);
    }

    function removeAdapter(uint256 chainId) external onlyOwner {
        require(adapters[chainId] != address(0), "Adapter not found");
        delete adapters[chainId];
        emit AdapterRemoved(chainId);
    }

    // --- USER INTERFACE ---

    /// @notice Initiate a cross-chain asset transfer.
    function deposit(
        address receiver,
        uint256 amount,
        uint256 targetChainId,
        bytes calldata extraData
    ) external payable notPaused {
        address adapter = adapters[targetChainId];
        require(adapter != address(0), "Target chain not supported");
        nonce += 1;
        IBridgeAdapter(adapter).deposit{value: msg.value}(
            msg.sender,
            receiver,
            amount,
            targetChainId,
            extraData
        );
        emit DepositInitiated(
            nonce,
            msg.sender,
            receiver,
            amount,
            targetChainId,
            adapter,
            extraData
        );
    }

    /// @notice Finalize a withdrawal from a cross-chain transfer.
    /// @dev Called by the adapter after validation (multi-sig, ZKP, or proof).
    function finalizeWithdrawal(
        uint256 remoteNonce,
        address receiver,
        uint256 amount,
        uint256 sourceChainId,
        address adapter,
        bytes calldata extraData,
        bytes calldata proof
    ) external notPaused {
        require(msg.sender == adapters[sourceChainId], "Unauthorized adapter");
        // Prevent replay
        bytes32 opHash = keccak256(
            abi.encodePacked(remoteNonce, receiver, amount, sourceChainId, adapter, extraData)
        );
        require(!processedNonces[opHash], "Already processed");
        processedNonces[opHash] = true;

        // Security: Here you can verify proof (multi-sig, ZKP, etc.) from the adapter
        // For extensibility, assume adapter already checks proof validity

        IBridgeAdapter(adapter).withdraw(receiver, amount, sourceChainId, extraData);

        emit WithdrawalFinalized(
            remoteNonce,
            receiver,
            amount,
            sourceChainId,
            adapter,
            extraData
        );
    }

    // --- VIEW HELPERS ---

    function getAdapter(uint256 chainId) external view returns (address) {
        return adapters[chainId];
    }

    function isNonceProcessed(
        uint256 remoteNonce,
        address receiver,
        uint256 amount,
        uint256 sourceChainId,
        address adapter,
        bytes calldata extraData
    ) external view returns (bool) {
        bytes32 opHash = keccak256(
            abi.encodePacked(remoteNonce, receiver, amount, sourceChainId, adapter, extraData)
        );
        return processedNonces[opHash];
    }

    // --- UPGRADEABILITY (optional: proxy pattern) ---

    // Add upgradeability via UniversalUpgradeableProxy if needed.
}
