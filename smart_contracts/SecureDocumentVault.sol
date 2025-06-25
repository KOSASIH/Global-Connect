// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title SecureDocumentVault
/// @notice Unstoppable, upgradeable, privacy-preserving on-chain vault for encrypted documents, proofs, agreements, and IP. Supports ZK links, role-based access, and audit trails.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract SecureDocumentVault is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    enum AccessLevel { None, Viewer, Editor, Admin }

    struct Document {
        address owner;
        string uri;                // Encrypted file location (IPFS/Arweave)
        bytes32 hash;              // SHA256 or similar hash of the original content
        uint256 createdAt;
        bytes zkProofLink;         // (Optional) ZK proof link/reference
        bool exists;
    }

    mapping(bytes32 => Document) public documents; // docId => Document
    mapping(bytes32 => mapping(address => AccessLevel)) public access; // docId => user => level
    mapping(bytes32 => address[]) public viewers; // docId => viewers

    event DocumentAdded(bytes32 indexed docId, address indexed owner, string uri, bytes32 hash, bytes zkProofLink);
    event AccessGranted(bytes32 indexed docId, address indexed user, AccessLevel level);
    event AccessRevoked(bytes32 indexed docId, address indexed user);
    event DocumentEdited(bytes32 indexed docId, address indexed editor, string newUri, bytes32 newHash, bytes zkProofLink);
    event DocumentViewed(bytes32 indexed docId, address indexed viewer, uint256 timestamp);

    // --- Upgradeability ---
    function initialize(address owner_) public initializer {
        __Ownable_init(owner_);
        __UUPSUpgradeable_init();
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Document Management ---

    function addDocument(
        string calldata uri,
        bytes32 hash,
        bytes calldata zkProofLink
    ) external returns (bytes32 docId) {
        docId = keccak256(abi.encodePacked(msg.sender, block.timestamp, uri, hash));
        require(!documents[docId].exists, "Already exists");
        documents[docId] = Document(msg.sender, uri, hash, block.timestamp, zkProofLink, true);
        access[docId][msg.sender] = AccessLevel.Admin;
        viewers[docId].push(msg.sender);
        emit DocumentAdded(docId, msg.sender, uri, hash, zkProofLink);
    }

    function editDocument(
        bytes32 docId,
        string calldata newUri,
        bytes32 newHash,
        bytes calldata zkProofLink
    ) external onlyEditor(docId) {
        Document storage doc = documents[docId];
        require(doc.exists, "Not found");
        doc.uri = newUri;
        doc.hash = newHash;
        doc.zkProofLink = zkProofLink;
        emit DocumentEdited(docId, msg.sender, newUri, newHash, zkProofLink);
    }

    // --- Access Control ---

    modifier onlyAdmin(bytes32 docId) {
        require(access[docId][msg.sender] == AccessLevel.Admin, "Not admin");
        _;
    }

    modifier onlyEditor(bytes32 docId) {
        AccessLevel level = access[docId][msg.sender];
        require(level == AccessLevel.Editor || level == AccessLevel.Admin, "Not editor");
        _;
    }

    function grantAccess(bytes32 docId, address user, AccessLevel level) external onlyAdmin(docId) {
        require(level != AccessLevel.None, "Cannot grant none");
        access[docId][user] = level;
        viewers[docId].push(user);
        emit AccessGranted(docId, user, level);
    }

    function revokeAccess(bytes32 docId, address user) external onlyAdmin(docId) {
        access[docId][user] = AccessLevel.None;
        emit AccessRevoked(docId, user);
    }

    // --- View Document (with Audit Trail) ---

    function viewDocument(bytes32 docId) external returns (
        string memory uri,
        bytes32 hash,
        uint256 createdAt,
        bytes memory zkProofLink
    ) {
        require(
            access[docId][msg.sender] == AccessLevel.Viewer ||
            access[docId][msg.sender] == AccessLevel.Editor ||
            access[docId][msg.sender] == AccessLevel.Admin,
            "No view access"
        );
        Document storage doc = documents[docId];
        require(doc.exists, "Not found");
        emit DocumentViewed(docId, msg.sender, block.timestamp);
        return (doc.uri, doc.hash, doc.createdAt, doc.zkProofLink);
    }

    // --- Multi-party Sharing ---

    function getViewers(bytes32 docId) external view returns (address[] memory) {
        return viewers[docId];
    }

    // --- Utility Functions ---

    function getAccessLevel(bytes32 docId, address user) external view returns (AccessLevel) {
        return access[docId][user];
    }

    function documentExists(bytes32 docId) external view returns (bool) {
        return documents[docId].exists;
    }
}
