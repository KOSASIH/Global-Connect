// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title SelfSovereignIdentityHub
/// @notice Ultra-advanced, unstoppable Self-Sovereign Identity (SSI) hub for DIDs, VCs, proofs, delegation, and reputation integration. Modular, privacy-ready, DAO/DeFi compatible.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

contract SelfSovereignIdentityHub is Ownable {
    struct Credential {
        bytes32 id;
        string uri;           // Off-chain VC URI (IPFS/Arweave or HTTP)
        bytes32 hash;         // Hash of credential content
        uint256 issuedAt;
        uint256 expiresAt;
        address issuer;
        bool revoked;
    }

    struct DIDProfile {
        address owner;
        string did;                   // Decentralized Identifier (e.g., did:ethr:0x123...)
        string metadataURI;           // Off-chain profile (optionally encrypted)
        bytes zkProof;                // Optional ZK proof for privacy-preserving claims
        uint256 createdAt;
        bool exists;
    }

    // DID string => profile
    mapping(string => DIDProfile) public profiles;
    // DID string => credentialId => Credential
    mapping(string => mapping(bytes32 => Credential)) public credentials;
    // DID string => delegates
    mapping(string => mapping(address => bool)) public delegates;
    // DID string => verifiers (trusted issuers)
    mapping(string => mapping(address => bool)) public trustedVerifiers;

    event ProfileRegistered(string indexed did, address indexed owner, string metadataURI, bytes zkProof);
    event ProfileUpdated(string indexed did, string metadataURI, bytes zkProof);
    event DelegateAdded(string indexed did, address indexed delegate);
    event DelegateRemoved(string indexed did, address indexed delegate);
    event CredentialAdded(string indexed did, bytes32 indexed credId, address indexed issuer, string uri, uint256 expiresAt);
    event CredentialRevoked(string indexed did, bytes32 indexed credId, address indexed issuer);
    event TrustedVerifierAdded(string indexed did, address verifier);
    event TrustedVerifierRemoved(string indexed did, address verifier);

    modifier onlyDIDOwner(string memory did) {
        require(profiles[did].owner == msg.sender, "Not DID owner");
        _;
    }

    modifier onlyDelegateOrOwner(string memory did) {
        require(
            profiles[did].owner == msg.sender || delegates[did][msg.sender],
            "Not owner or delegate"
        );
        _;
    }

    // --- Profile Management ---

    function registerProfile(
        string memory did,
        string memory metadataURI,
        bytes calldata zkProof
    ) external {
        require(!profiles[did].exists, "Already registered");
        profiles[did] = DIDProfile(
            msg.sender,
            did,
            metadataURI,
            zkProof,
            block.timestamp,
            true
        );
        emit ProfileRegistered(did, msg.sender, metadataURI, zkProof);
    }

    function updateProfile(
        string memory did,
        string memory metadataURI,
        bytes calldata zkProof
    ) external onlyDIDOwner(did) {
        profiles[did].metadataURI = metadataURI;
        profiles[did].zkProof = zkProof;
        emit ProfileUpdated(did, metadataURI, zkProof);
    }

    // --- Delegate Management ---

    function addDelegate(string memory did, address delegate) external onlyDIDOwner(did) {
        delegates[did][delegate] = true;
        emit DelegateAdded(did, delegate);
    }

    function removeDelegate(string memory did, address delegate) external onlyDIDOwner(did) {
        delegates[did][delegate] = false;
        emit DelegateRemoved(did, delegate);
    }

    // --- Trusted Verifier Management ---

    function addTrustedVerifier(string memory did, address verifier) external onlyDIDOwner(did) {
        trustedVerifiers[did][verifier] = true;
        emit TrustedVerifierAdded(did, verifier);
    }

    function removeTrustedVerifier(string memory did, address verifier) external onlyDIDOwner(did) {
        trustedVerifiers[did][verifier] = false;
        emit TrustedVerifierRemoved(did, verifier);
    }

    // --- Credential Management ---

    function addCredential(
        string memory did,
        bytes32 credId,
        string calldata uri,
        bytes32 hash,
        uint256 expiresAt
    ) external {
        require(profiles[did].exists, "Profile not exist");
        require(
            msg.sender == profiles[did].owner ||
            delegates[did][msg.sender] ||
            trustedVerifiers[did][msg.sender],
            "Not authorized"
        );
        Credential storage c = credentials[did][credId];
        require(c.issuedAt == 0, "Already exists");
        c.id = credId;
        c.uri = uri;
        c.hash = hash;
        c.issuedAt = block.timestamp;
        c.expiresAt = expiresAt;
        c.issuer = msg.sender;
        c.revoked = false;
        emit CredentialAdded(did, credId, msg.sender, uri, expiresAt);
    }

    function revokeCredential(string memory did, bytes32 credId) external {
        Credential storage c = credentials[did][credId];
        require(c.issuedAt != 0, "Not found");
        require(
            msg.sender == c.issuer || msg.sender == profiles[did].owner,
            "Not issuer or owner"
        );
        c.revoked = true;
        emit CredentialRevoked(did, credId, c.issuer);
    }

    // --- View Functions ---

    function getProfile(string memory did) external view returns (
        address owner,
        string memory metadataURI,
        bytes memory zkProof,
        uint256 createdAt,
        bool exists
    ) {
        DIDProfile storage p = profiles[did];
        return (p.owner, p.metadataURI, p.zkProof, p.createdAt, p.exists);
    }

    function getCredential(string memory did, bytes32 credId) external view returns (
        bytes32 id,
        string memory uri,
        bytes32 hash,
        uint256 issuedAt,
        uint256 expiresAt,
        address issuer,
        bool revoked
    ) {
        Credential storage c = credentials[did][credId];
        return (c.id, c.uri, c.hash, c.issuedAt, c.expiresAt, c.issuer, c.revoked);
    }

    function isDelegate(string memory did, address delegate) external view returns (bool) {
        return delegates[did][delegate];
    }

    function isTrustedVerifier(string memory did, address verifier) external view returns (bool) {
        return trustedVerifiers[did][verifier];
    }
}
