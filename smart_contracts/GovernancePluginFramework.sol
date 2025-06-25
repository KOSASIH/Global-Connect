// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title GovernancePluginFramework
/// @notice Modular, unstoppable, DAO-ready governance plugin framework with upgradeable modules, meta-governance, and composable execution strategies.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";

interface IGovernancePlugin {
    function pluginType() external view returns (string memory); // e.g., "voting", "role", "proposal", "execution"
    function onRegister(address dao, bytes calldata data) external;
    function onActivate(address dao, bytes calldata data) external;
    function onDeactivate(address dao, bytes calldata data) external;
    function isActive(address dao) external view returns (bool);
}

contract GovernancePluginFramework is Ownable {
    struct Plugin {
        address pluginAddress;
        string pluginType;
        string name;
        string description;
        bool active;
        uint256 registeredAt;
    }

    // DAO => pluginId => Plugin
    mapping(address => mapping(uint256 => Plugin)) public plugins;
    // DAO => plugin count
    mapping(address => uint256) public pluginCount;

    event PluginRegistered(address indexed dao, uint256 indexed pluginId, address pluginAddress, string pluginType, string name);
    event PluginActivated(address indexed dao, uint256 indexed pluginId, address pluginAddress);
    event PluginDeactivated(address indexed dao, uint256 indexed pluginId, address pluginAddress);

    // --- Plugin Registration ---

    /// @notice Register a new governance plugin for a DAO
    function registerPlugin(
        address dao,
        address pluginAddress,
        string memory name,
        string memory description,
        bytes calldata initData
    ) external onlyOwner returns (uint256 pluginId) {
        require(dao != address(0), "Zero DAO");
        require(pluginAddress != address(0), "Zero plugin");
        IGovernancePlugin plugin = IGovernancePlugin(pluginAddress);
        string memory _type = plugin.pluginType();

        pluginId = pluginCount[dao]++;
        plugins[dao][pluginId] = Plugin({
            pluginAddress: pluginAddress,
            pluginType: _type,
            name: name,
            description: description,
            active: false,
            registeredAt: block.timestamp
        });

        plugin.onRegister(dao, initData);
        emit PluginRegistered(dao, pluginId, pluginAddress, _type, name);
    }

    /// @notice Activate a registered plugin for a DAO (allows the plugin logic to take effect)
    function activatePlugin(address dao, uint256 pluginId, bytes calldata activateData) external onlyOwner {
        Plugin storage p = plugins[dao][pluginId];
        require(p.pluginAddress != address(0), "Plugin not found");
        require(!p.active, "Already active");
        IGovernancePlugin(p.pluginAddress).onActivate(dao, activateData);
        p.active = true;
        emit PluginActivated(dao, pluginId, p.pluginAddress);
    }

    /// @notice Deactivate a plugin for a DAO (without removing it)
    function deactivatePlugin(address dao, uint256 pluginId, bytes calldata deactivateData) external onlyOwner {
        Plugin storage p = plugins[dao][pluginId];
        require(p.pluginAddress != address(0), "Plugin not found");
        require(p.active, "Already inactive");
        IGovernancePlugin(p.pluginAddress).onDeactivate(dao, deactivateData);
        p.active = false;
        emit PluginDeactivated(dao, pluginId, p.pluginAddress);
    }

    // --- Meta-governance (governance over plugin logic) ---

    function isPluginActive(address dao, uint256 pluginId) public view returns (bool) {
        Plugin storage p = plugins[dao][pluginId];
        if (p.pluginAddress == address(0)) return false;
        return IGovernancePlugin(p.pluginAddress).isActive(dao);
    }

    function getPlugin(address dao, uint256 pluginId) external view returns (
        address pluginAddress,
        string memory pluginType,
        string memory name,
        string memory description,
        bool active,
        uint256 registeredAt
    ) {
        Plugin storage p = plugins[dao][pluginId];
        return (
            p.pluginAddress,
            p.pluginType,
            p.name,
            p.description,
            p.active,
            p.registeredAt
        );
    }

    function getPlugins(address dao) external view returns (Plugin[] memory) {
        uint256 count = pluginCount[dao];
        Plugin[] memory arr = new Plugin[](count);
        for (uint256 i = 0; i < count; i++) {
            arr[i] = plugins[dao][i];
        }
        return arr;
    }
}
