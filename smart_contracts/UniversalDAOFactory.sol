// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalDAOFactory
/// @notice Modular, unstoppable, plug-and-play DAO factory for any organization. ERC20/NFT/Plugin modules, governance, and registry. DAO/protocol/community/DeFi ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IDAOModule {
    function onInstall(address dao, bytes calldata data) external;
}

contract UniversalDAOFactory is Ownable {
    event DAOCreated(
        address indexed dao,
        address indexed creator,
        string name,
        string metadataURI,
        address[] modules
    );
    event ModuleRegistered(address indexed module, string moduleType, string description);
    event ModuleUnregistered(address indexed module);

    struct ModuleInfo {
        string moduleType;      // "governance", "treasury", "nft", "access", etc.
        string description;     // Human-readable description
        bool active;
    }

    struct DAOInfo {
        string name;
        string metadataURI;     // Off-chain docs, IPFS, etc.
        address creator;
        address[] modules;
        uint256 createdAt;
    }

    mapping(address => ModuleInfo) public registeredModules;
    address[] public moduleList;

    mapping(address => DAOInfo) public daos;
    address[] public daoList;

    // --- Module Registry ---

    function registerModule(address module, string calldata moduleType, string calldata description) external onlyOwner {
        registeredModules[module] = ModuleInfo({
            moduleType: moduleType,
            description: description,
            active: true
        });
        moduleList.push(module);
        emit ModuleRegistered(module, moduleType, description);
    }

    function unregisterModule(address module) external onlyOwner {
        registeredModules[module].active = false;
        emit ModuleUnregistered(module);
    }

    function getModules() external view returns (address[] memory) {
        return moduleList;
    }

    // --- DAO Creation ---

    function createDAO(
        string calldata name,
        string calldata metadataURI,
        address[] calldata modules,
        bytes[] calldata initDatas
    ) external returns (address dao) {
        require(bytes(name).length > 0, "Name required");
        require(modules.length > 0, "No modules");
        require(modules.length == initDatas.length, "Init data length mismatch");
        for (uint256 i = 0; i < modules.length; i++) {
            require(registeredModules[modules[i]].active, "Inactive module");
        }

        // Deploy DAO as minimal proxy (EIP-1167) or blank logic address (for demo, use address(this))
        // In production, use CREATE2/minimal proxy logic.
        dao = address(uint160(uint256(keccak256(abi.encodePacked(msg.sender, name, block.timestamp, modules)))));
        DAOInfo storage info = daos[dao];
        info.name = name;
        info.metadataURI = metadataURI;
        info.creator = msg.sender;
        info.modules = modules;
        info.createdAt = block.timestamp;
        daoList.push(dao);

        // Install modules (call onInstall)
        for (uint256 i = 0; i < modules.length; i++) {
            IDAOModule(modules[i]).onInstall(dao, initDatas[i]);
        }

        emit DAOCreated(dao, msg.sender, name, metadataURI, modules);
    }

    // --- View Functions ---

    function getDAO(address dao) external view returns (
        string memory name,
        string memory metadataURI,
        address creator,
        address[] memory modules,
        uint256 createdAt
    ) {
        DAOInfo storage info = daos[dao];
        return (info.name, info.metadataURI, info.creator, info.modules, info.createdAt);
    }

    function getAllDAOs() external view returns (address[] memory) {
        return daoList;
    }
}
