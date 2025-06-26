// SPDX-License-Identifier: MIT
pragma soliditybool);
}

contract DecentralizedIdentityHub is Ownable {
    struct DIDProfile {
        address owner;
        string didURI; // e.g., did:ethr:0x..., IPFS, or ENS
        string metadataURI; // optional profile data (avatar, links, etc.)
        address[] credentialPlugins;
        address[] identityPlugins;
        uint256 createdAt;
        bool active;
    }

    mapping(address => DIDProfile) public profiles;
    mapping(address => bool) public registered;
    mapping(address => mapping(address => bool)) public recoveryGuardians; // subject => guardian => enabled

    event DIDRegistered(address");
        profiles[msg.sender].didURI = didURI;
        profiles[msg.sender].metadataURI = metadataURI;
        emit ProfileUpdated(msg.sender, didURI, metadataURI);
    }

    // --- Guardians (Social Recovery) ---

    function addGuardian(address guardian) external {
        require(registered[msg.sender], "Not registered");
        require(guardian != address(0), "Zero guardian");
        recoveryGuardians[msg.sender][guardian] = true;
        emit GuardianAdded(msg.sender, guardian);
    }

    function removeGuardian(address guardian) external {
        require(registered[msg.sender], "Not registered");
        recoveryGuardians[msg.sender, plugin), "No such plugin");
        ICredentialPlugin(plugin).revokeCredential(msg.sender, dataURI);
        emit CredentialRevoked(msg.sender, plugin, dataURI);
    }

    function verifyCredential(address subject, address plugin, string calldata dataURI, bytes calldata proof) external view returns (bool) {
        require(_hasPlugin(profiles[subject].credentialPlugins, plugin), "No such plugin");
        return ICredentialPlugin(plugin).verifyCredential(subject, dataURI, proof);
    }

    // --- Access Control (Identity Plugins) ---

    function isValid(address subject) public view returns (bool) {
        DIDProfile p.metadataURI,
            p.credentialPlugins,
            p.identityPlugins,
            p.createdAt,
            p.active
        );
    }

    function isGuardian(address subject, address guardian) external view returns (bool) {
        return recoveryGuardians[subject][guardian];
    }
}
