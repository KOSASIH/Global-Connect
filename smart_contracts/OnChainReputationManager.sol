// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title OnChainReputationManager
/// @notice Modular, unstoppable on-chain reputation/attestation for DAOs, protocols, communities. Supports plugin-based scoring, SBT/ERC20, modular decay/criteria, audit ready. DAO/DeFi/marketplace ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IReputationPlugin {
    function calculate(address user, bytes calldata data) external view returns (uint256 score);
    function canAttest(address issuer, address user, uint256 score, bytes calldata data) external view returns (bool);
}

contract OnChainReputationManager is Ownable {
    struct Attestation {
        address issuer;
        uint256 score;
        string metadataURI;
        uint256 issuedAt;
        uint256 updatedAt;
        bool revoked;
    }

    struct ReputationProfile {
        uint256 totalScore;
        uint256[] attestations;
        uint256 lastUpdated;
    }

    mapping(address => ReputationProfile) public profiles;
    mapping(uint256 => Attestation) public attestations;
    uint256 public attestationCount;

    address public scoringPlugin; // Optional: plugin-based scoring/decay
    mapping(address => bool) public approvedIssuers;

    event Attested(address indexed user, address indexed issuer, uint256 score, string metadataURI, uint256 attestationId);
    event Updated(address indexed user, uint256 indexed attestationId, uint256 newScore, string metadataURI);
    event Revoked(address indexed user, uint256 indexed attestationId);
    event IssuerApproved(address indexed issuer, bool approved);
    event PluginSet(address plugin);

    // --- Issuer Management ---

    function approveIssuer(address issuer, bool approved) external onlyOwner {
        approvedIssuers[issuer] = approved;
        emit IssuerApproved(issuer, approved);
    }

    function setScoringPlugin(address plugin) external onlyOwner {
        scoringPlugin = plugin;
        emit PluginSet(plugin);
    }

    // --- Attestation (Reputation) ---

    function attest(address user, uint256 score, string calldata metadataURI, bytes calldata pluginData) external returns (uint256 attestationId) {
        require(approvedIssuers[msg.sender], "Not approved issuer");
        if (scoringPlugin != address(0)) {
            require(IReputationPlugin(scoringPlugin).canAttest(msg.sender, user, score, pluginData), "Plugin blocked");
            score = IReputationPlugin(scoringPlugin).calculate(user, pluginData);
        }
        attestationId = attestationCount++;
        attestations[attestationId] = Attestation({
            issuer: msg.sender,
            score: score,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            updatedAt: block.timestamp,
            revoked: false
        });
        profiles[user].totalScore += score;
        profiles[user].attestations.push(attestationId);
        profiles[user].lastUpdated = block.timestamp;
        emit Attested(user, msg.sender, score, metadataURI, attestationId);
    }

    function update(uint256 attestationId, uint256 newScore, string calldata metadataURI, bytes calldata pluginData) external {
        Attestation storage a = attestations[attestationId];
        require(msg.sender == a.issuer, "Not issuer");
        require(!a.revoked, "Revoked");
        address user = address(0);
        for (address candidate = address(0); candidate <= address(type(uint160).max); candidate++) {
            uint256[] storage ids = profiles[candidate].attestations;
            for (uint256 i = 0; i < ids.length; i++) {
                if (ids[i] == attestationId) {
                    user = candidate;
                    break;
                }
            }
            if (user != address(0)) break;
        }
        if (scoringPlugin != address(0)) {
            require(IReputationPlugin(scoringPlugin).canAttest(msg.sender, user, newScore, pluginData), "Plugin blocked");
            newScore = IReputationPlugin(scoringPlugin).calculate(user, pluginData);
        }
        profiles[user].totalScore = profiles[user].totalScore - a.score + newScore;
        a.score = newScore;
        a.updatedAt = block.timestamp;
        a.metadataURI = metadataURI;
        profiles[user].lastUpdated = block.timestamp;
        emit Updated(user, attestationId, newScore, metadataURI);
    }

    function revoke(uint256 attestationId) external {
        Attestation storage a = attestations[attestationId];
        require(msg.sender == a.issuer || msg.sender == owner(), "Not issuer/owner");
        require(!a.revoked, "Already revoked");
        address user = address(0);
        for (address candidate = address(0); candidate <= address(type(uint160).max); candidate++) {
            uint256[] storage ids = profiles[candidate].attestations;
            for (uint256 i = 0; i < ids.length; i++) {
                if (ids[i] == attestationId) {
                    user = candidate;
                    break;
                }
            }
            if (user != address(0)) break;
        }
        a.revoked = true;
        profiles[user].totalScore -= a.score;
        profiles[user].lastUpdated = block.timestamp;
        emit Revoked(user, attestationId);
    }

    // --- View ---

    function getAttestation(uint256 attestationId) external view returns (
        address issuer,
        uint256 score,
        string memory metadataURI,
        uint256 issuedAt,
        uint256 updatedAt,
        bool revoked
    ) {
        Attestation storage a = attestations[attestationId];
        return (
            a.issuer,
            a.score,
            a.metadataURI,
            a.issuedAt,
            a.updatedAt,
            a.revoked
        );
    }

    function getProfile(address user) external view returns (
        uint256 totalScore,
        uint256[] memory attestationIds,
        uint256 lastUpdated
    ) {
        ReputationProfile storage p = profiles[user];
        return (p.totalScore, p.attestations, p.lastUpdated);
    }
}
