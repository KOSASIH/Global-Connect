// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DecentralizedReputationOracle
/// @notice Modular, unstoppable, privacy-ready reputation scoring for DAOs, SSI, DeFi, and Web3. Multi-attestor, plugin-based, with on-chain audit and ZK support.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IReputationPlugin {
    function score(address subject) external view returns (uint256);
    function supportsZK(address subject, bytes calldata proof) external view returns (bool);
}

contract DecentralizedReputationOracle is Ownable {
    struct Attestation {
        address attestor;
        uint256 score;
        uint256 issuedAt;
        uint256 expiresAt;
        string dataURI; // Optional off-chain data (IPFS/Arweave)
        bool revoked;
    }

    struct ReputationProfile {
        uint256 aggregateScore;
        uint256 lastUpdated;
        uint256 attestationCount;
        mapping(uint256 => Attestation) attestations;
        mapping(address => uint256) attestorIndex; // attestor => index+1 (0 = none)
    }

    mapping(address => ReputationProfile) internal profiles;
    mapping(address => bool) public attestors;
    mapping(address => address) public plugin; // subject => plugin

    event AttestorAdded(address indexed attestor);
    event AttestorRemoved(address indexed attestor);
    event AttestationAdded(address indexed subject, address indexed attestor, uint256 score, uint256 expiresAt, string dataURI);
    event AttestationRevoked(address indexed subject, address indexed attestor, uint256 attestationIndex);
    event ReputationPluginSet(address indexed subject, address plugin);
    event AggregateScoreUpdated(address indexed subject, uint256 newAggregateScore);

    modifier onlyAttestor() {
        require(attestors[msg.sender], "Not attestor");
        _;
    }

    // --- Attestor Management ---

    function addAttestor(address attestor) external onlyOwner {
        attestors[attestor] = true;
        emit AttestorAdded(attestor);
    }

    function removeAttestor(address attestor) external onlyOwner {
        attestors[attestor] = false;
        emit AttestorRemoved(attestor);
    }

    // --- Reputation Attestations ---

    function addAttestation(
        address subject,
        uint256 score,
        uint256 expiresAt,
        string calldata dataURI
    ) external onlyAttestor {
        require(subject != address(0), "No subject");
        require(score <= 1e18, "Score too high");
        ReputationProfile storage p = profiles[subject];
        uint256 idx = p.attestationCount++;
        p.attestations[idx] = Attestation({
            attestor: msg.sender,
            score: score,
            issuedAt: block.timestamp,
            expiresAt: expiresAt,
            dataURI: dataURI,
            revoked: false
        });
        p.attestorIndex[msg.sender] = idx + 1;
        _updateAggregate(subject);
        emit AttestationAdded(subject, msg.sender, score, expiresAt, dataURI);
    }

    function revokeAttestation(address subject) external onlyAttestor {
        ReputationProfile storage p = profiles[subject];
        uint256 idx = p.attestorIndex[msg.sender];
        require(idx > 0, "No attestation");
        Attestation storage a = p.attestations[idx - 1];
        require(!a.revoked, "Already revoked");
        a.revoked = true;
        _updateAggregate(subject);
        emit AttestationRevoked(subject, msg.sender, idx - 1);
    }

    // --- Aggregate/Plugin Scoring ---

    function setPlugin(address subject, address _plugin) external onlyOwner {
        plugin[subject] = _plugin;
        emit ReputationPluginSet(subject, _plugin);
        _updateAggregate(subject);
    }

    function _updateAggregate(address subject) internal {
        address p = plugin[subject];
        uint256 agg;
        if (p != address(0)) {
            try IReputationPlugin(p).score(subject) returns (uint256 s) {
                agg = s;
            } catch {
                agg = _defaultAggregate(subject);
            }
        } else {
            agg = _defaultAggregate(subject);
        }
        profiles[subject].aggregateScore = agg;
        profiles[subject].lastUpdated = block.timestamp;
        emit AggregateScoreUpdated(subject, agg);
    }

    function _defaultAggregate(address subject) internal view returns (uint256) {
        ReputationProfile storage p = profiles[subject];
        if (p.attestationCount == 0) return 0;
        uint256 sum;
        uint256 valid;
        for (uint256 i = 0; i < p.attestationCount; i++) {
            Attestation storage a = p.attestations[i];
            if (!a.revoked && (a.expiresAt == 0 || a.expiresAt > block.timestamp)) {
                sum += a.score;
                valid++;
            }
        }
        return valid > 0 ? sum / valid : 0;
    }

    // --- ZK Proof Support (optional) ---

    function verifyZK(address subject, bytes calldata proof) external view returns (bool) {
        address p = plugin[subject];
        require(p != address(0), "No plugin");
        return IReputationPlugin(p).supportsZK(subject, proof);
    }

    // --- View Functions ---

    function getAggregateScore(address subject) external view returns (uint256, uint256) {
        ReputationProfile storage p = profiles[subject];
        return (p.aggregateScore, p.lastUpdated);
    }

    function getAttestation(address subject, uint256 idx) external view returns (
        address attestor,
        uint256 score,
        uint256 issuedAt,
        uint256 expiresAt,
        string memory dataURI,
        bool revoked
    ) {
        Attestation storage a = profiles[subject].attestations[idx];
        return (a.attestor, a.score, a.issuedAt, a.expiresAt, a.dataURI, a.revoked);
    }

    function attestationCount(address subject) external view returns (uint256) {
        return profiles[subject].attestationCount;
    }
}
