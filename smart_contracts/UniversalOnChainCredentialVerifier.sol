// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainCredentialVerifier
/// @notice Modular, unstoppable, plugin-based on-chain proof/credential verifier. Supports Merkle/signature/ZKP/plugins, DAO/protocol/DeFi/community ready, composable for gating, airdrops, or trustless workflows.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IProofPlugin {
    function verify(address user, bytes calldata proofData) external view returns (bool);
}

contract UniversalOnChainCredentialVerifier is Ownable {
    struct CredentialType {
        string name;
        address plugin;
        string metadataURI;
        bool active;
        uint256 registeredAt;
    }

    uint256 public credentialTypeCount;
    mapping(uint256 => CredentialType) public credentialTypes;

    mapping(address => mapping(uint256 => bool)) public verified; // user => credentialType => verified

    event CredentialTypeRegistered(uint256 indexed typeId, string name, address plugin, string metadataURI);
    event CredentialTypeStatusChanged(uint256 indexed typeId, bool active);
    event Verified(address indexed user, uint256 indexed typeId, bool success);

    // --- Register Credential Type (Proof Plugin) ---

    function registerCredentialType(
        string calldata name,
        address plugin,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 typeId) {
        require(plugin != address(0), "No plugin");
        require(bytes(name).length > 0, "No name");
        typeId = credentialTypeCount++;
        credentialTypes[typeId] = CredentialType({
            name: name,
            plugin: plugin,
            metadataURI: metadataURI,
            active: true,
            registeredAt: block.timestamp
        });
        emit CredentialTypeRegistered(typeId, name, plugin, metadataURI);
    }

    function setCredentialTypeStatus(uint256 typeId, bool active) external onlyOwner {
        credentialTypes[typeId].active = active;
        emit CredentialTypeStatusChanged(typeId, active);
    }

    // --- Verify Credential ---

    function verifyCredential(uint256 typeId, bytes calldata proofData) external returns (bool) {
        CredentialType storage ct = credentialTypes[typeId];
        require(ct.active, "Type inactive");
        require(ct.plugin != address(0), "No plugin");
        bool ok = IProofPlugin(ct.plugin).verify(msg.sender, proofData);
        verified[msg.sender][typeId] = ok;
        emit Verified(msg.sender, typeId, ok);
        return ok;
    }

    // --- View ---

    function getCredentialType(uint256 typeId) external view returns (
        string memory name,
        address plugin,
        string memory metadataURI,
        bool active,
        uint256 registeredAt
    ) {
        CredentialType storage ct = credentialTypes[typeId];
        return (
            ct.name,
            ct.plugin,
            ct.metadataURI,
            ct.active,
            ct.registeredAt
        );
    }

    function isVerified(address user, uint256 typeId) external view returns (bool) {
        return verified[user][typeId];
    }
}
