// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title IdentityZKPassport
/// @notice Privacy-preserving, Sybil-resistant, ZK-based identity and credential registry for web3 users.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IVerifier {
    function verifyProof(bytes calldata proof, uint256 root, uint256 nullifierHash, uint256 signal) external view returns (bool);
}

contract IdentityZKPassport {
    // --- EVENTS ---
    event Registered(address indexed user, uint256 indexed identityCommitment, uint256 root);
    event CredentialAttested(address indexed user, uint256 indexed credentialType, bytes32 credentialHash, uint256 root);
    event CredentialRevoked(address indexed user, uint256 indexed credentialType, bytes32 credentialHash);
    event ProofVerified(address indexed user, uint256 signal, bool valid);

    // --- STRUCTS ---
    struct Credential {
        uint256 credentialType;
        bytes32 credentialHash;
        uint256 issuedAt;
        bool valid;
    }

    // --- STORAGE ---
    address public owner;
    IVerifier public verifier;
    uint256 public groupRoot; // Merkle root of registered identity commitments
    mapping(address => uint256) public identityCommitments; // user => identity commitment
    mapping(uint256 => address) public commitmentOwners; // commitment => user
    mapping(address => Credential[]) public credentials; // user => credentials
    mapping(bytes32 => bool) public revokedCredentials; // credential hash => revoked

    uint256 public sybilThreshold; // Minimum time/delay between registrations (anti-Sybil)
    mapping(address => uint256) public lastRegistration; // user => last registration timestamp

    // --- MODIFIERS ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // --- CONSTRUCTOR ---
    constructor(address _verifier, uint256 _sybilThreshold) {
        require(_verifier != address(0), "Invalid verifier");
        owner = msg.sender;
        verifier = IVerifier(_verifier);
        sybilThreshold = _sybilThreshold;
    }

    // --- REGISTRATION & SYBIL RESISTANCE ---

    function register(uint256 identityCommitment, uint256 _groupRoot) external {
        require(identityCommitments[msg.sender] == 0, "Already registered");
        require(block.timestamp - lastRegistration[msg.sender] >= sybilThreshold, "Sybil protection");
        // In practice, update Merkle root off-chain and update root on-chain
        identityCommitments[msg.sender] = identityCommitment;
        commitmentOwners[identityCommitment] = msg.sender;
        groupRoot = _groupRoot;
        lastRegistration[msg.sender] = block.timestamp;
        emit Registered(msg.sender, identityCommitment, groupRoot);
    }

    // --- CREDENTIAL ATTESTATION & REVOCATION ---

    function attestCredential(
        uint256 credentialType,
        bytes32 credentialHash,
        uint256 _groupRoot
    ) external {
        require(identityCommitments[msg.sender] != 0, "Not registered");
        credentials[msg.sender].push(Credential({
            credentialType: credentialType,
            credentialHash: credentialHash,
            issuedAt: block.timestamp,
            valid: true
        }));
        groupRoot = _groupRoot;
        emit CredentialAttested(msg.sender, credentialType, credentialHash, groupRoot);
    }

    function revokeCredential(
        uint256 credentialType,
        bytes32 credentialHash
    ) external {
        require(identityCommitments[msg.sender] != 0, "Not registered");
        Credential[] storage creds = credentials[msg.sender];
        for (uint256 i = 0; i < creds.length; i++) {
            if (
                creds[i].credentialType == credentialType &&
                creds[i].credentialHash == credentialHash &&
                creds[i].valid
            ) {
                creds[i].valid = false;
                revokedCredentials[credentialHash] = true;
                emit CredentialRevoked(msg.sender, credentialType, credentialHash);
                break;
            }
        }
    }

    // --- ZK PROOF VERIFICATION ---

    /// @notice Verifies a zero-knowledge proof for a registered identity and credential.
    /// @param proof Zero-knowledge proof bytes (format depends on verifier implementation, e.g. Semaphore, custom ZK).
    /// @param root Merkle root of the identity group.
    /// @param nullifierHash Unique nullifier for Sybil resistance.
    /// @param signal Arbitrary signal (e.g., to prove credential or action).
    function verifyZKProof(
        bytes calldata proof,
        uint256 root,
        uint256 nullifierHash,
        uint256 signal
    ) external returns (bool valid) {
        valid = verifier.verifyProof(proof, root, nullifierHash, signal);
        emit ProofVerified(msg.sender, signal, valid);
    }

    // --- ADMIN FUNCTIONS ---

    function setVerifier(address _verifier) external onlyOwner {
        require(_verifier != address(0), "Invalid verifier");
        verifier = IVerifier(_verifier);
    }

    function setSybilThreshold(uint256 _sybilThreshold) external onlyOwner {
        sybilThreshold = _sybilThreshold;
    }

    function setGroupRoot(uint256 _groupRoot) external onlyOwner {
        groupRoot = _groupRoot;
    }

    // --- VIEW HELPERS ---

    function getCredentials(address user) external view returns (Credential[] memory) {
        return credentials[user];
    }

    function isCredentialRevoked(bytes32 credentialHash) external view returns (bool) {
        return revokedCredentials[credentialHash];
    }

    function getIdentityCommitment(address user) external view returns (uint256) {
        return identityCommitments[user];
    }

    function getCommitmentOwner(uint256 commitment) external view returns (address) {
        return commitmentOwners[commitment];
    }
}
