// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalMetaTransactionHub
/// @notice Unstoppable, modular meta-transaction hub for gasless transactions, multi-relayer, plugin auth, batching, and ERC20/native fee support. DAO/developer/NFT/DeFi ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISigAuthPlugin {
    function isValidSignature(address user, bytes32 digest, bytes calldata sig) external view returns (bool);
}

contract UniversalMetaTransactionHub is Ownable {
    struct MetaTx {
        address user;
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
        uint256 deadline;
        address feeToken; // address(0) = native
        uint256 feeAmount;
        address relayer;
        bytes sig;
    }

    mapping(address => uint256) public nonces;
    mapping(address => address) public sigAuthPlugin; // user => plugin
    mapping(address => bool) public trustedRelayers;

    event RelayerAdded(address relayer);
    event RelayerRemoved(address relayer);
    event SigAuthPluginSet(address indexed user, address plugin);
    event MetaTxExecuted(address indexed user, address indexed relayer, address indexed to, uint256 value, uint256 nonce, bool success);
    event FeePaid(address indexed user, address indexed relayer, address feeToken, uint256 feeAmount);

    modifier onlyRelayer() {
        require(trustedRelayers[msg.sender], "Not trusted relayer");
        _;
    }

    // --- Relayer Management ---

    function addRelayer(address relayer) external onlyOwner {
        trustedRelayers[relayer] = true;
        emit RelayerAdded(relayer);
    }

    function removeRelayer(address relayer) external onlyOwner {
        trustedRelayers[relayer] = false;
        emit RelayerRemoved(relayer);
    }

    // --- Signature Plugin Management ---

    function setSigAuthPlugin(address user, address plugin) external onlyOwner {
        sigAuthPlugin[user] = plugin;
        emit SigAuthPluginSet(user, plugin);
    }

    // --- Meta-Transaction Execution ---

    function executeMetaTx(
        address user,
        address to,
        uint256 value,
        bytes calldata data,
        uint256 nonce,
        uint256 deadline,
        address feeToken,
        uint256 feeAmount,
        bytes calldata sig
    ) external onlyRelayer returns (bool success) {
        require(deadline == 0 || block.timestamp <= deadline, "Expired");
        require(nonce == nonces[user], "Invalid nonce");
        require(to != address(0), "Zero to");
        address plugin = sigAuthPlugin[user];
        require(plugin != address(0), "No sig plugin");

        bytes32 digest = getDigest(user, to, value, data, nonce, deadline, feeToken, feeAmount, msg.sender);

        require(ISigAuthPlugin(plugin).isValidSignature(user, digest, sig), "Invalid signature");

        nonces[user]++;

        // Fee payment
        if (feeAmount > 0) {
            if (feeToken == address(0)) {
                require(msg.value >= feeAmount, "Insufficient ETH for fee");
                payable(msg.sender).transfer(feeAmount);
            } else {
                IERC20(feeToken).transferFrom(user, msg.sender, feeAmount);
            }
            emit FeePaid(user, msg.sender, feeToken, feeAmount);
        }

        // Call target contract
        (success, ) = to.call{value: value}(data);
        emit MetaTxExecuted(user, msg.sender, to, value, nonce, success);
    }

    // --- Batching ---

    function executeBatchMetaTx(MetaTx[] calldata txs) external onlyRelayer {
        for (uint256 i = 0; i < txs.length; i++) {
            executeMetaTx(
                txs[i].user,
                txs[i].to,
                txs[i].value,
                txs[i].data,
                txs[i].nonce,
                txs[i].deadline,
                txs[i].feeToken,
                txs[i].feeAmount,
                txs[i].sig
            );
        }
    }

    // --- Digest Construction (EIP-712-like) ---

    function getDigest(
        address user,
        address to,
        uint256 value,
        bytes memory data,
        uint256 nonce,
        uint256 deadline,
        address feeToken,
        uint256 feeAmount,
        address relayer
    ) public pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "UniversalMetaTx:",
                user, to, value, keccak256(data), nonce, deadline, feeToken, feeAmount, relayer
            )
        );
    }

    // --- View Functions ---

    function getUserNonce(address user) external view returns (uint256) {
        return nonces[user];
    }

    function isRelayer(address relayer) external view returns (bool) {
        return trustedRelayers[relayer];
    }

    function getSigAuthPlugin(address user) external view returns (address) {
        return sigAuthPlugin[user];
    }

    receive() external payable {}
}
