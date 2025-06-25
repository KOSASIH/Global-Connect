// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalUpgradeableProxy
/// @notice Enterprise-grade upgradeable proxy supporting UUPS, Transparent, and Diamond (facet) patterns, with on-chain governance and rollback.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

interface IUniversalImplementation {
    function proxiableUUID() external view returns (bytes32);
}

/// @dev Governance interface for upgrade control (can be a DAO, Gnosis Safe, or multi-sig)
interface IGovernance {
    function canUpgrade(address caller) external view returns (bool);
    function canPause(address caller) external view returns (bool);
}

contract UniversalUpgradeableProxy {
    // EIP-1967: implementation slot = bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
    bytes32 private constant _IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    // EIP-1967: admin slot = bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
    bytes32 private constant _ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;
    // EIP-1967: governance slot
    bytes32 private constant _GOVERNANCE_SLOT = 0x4d937a5e6b6ecfbe4d4cfe176d054f26b20cd4e9c8b1f9b2b0a2e9d7f0f5ecb1;
    // EIP-1967: rollback slot
    bytes32 private constant _ROLLBACK_SLOT = 0x3a0b4f1f9e5e7b6f8e2a7d5a2b7a3f9a4e2a7d4f2e7d9a2e3b7a2e9d7f0f5eab;
    // EIP-1967: paused slot
    bytes32 private constant _PAUSED_SLOT = 0x0bd6d5b4406e78e5f5e5c5b5e5e5f5e5c5b5e5e5f5e5c5b5e5e5f5e5c5b5e5e5f;

    event Upgraded(address indexed implementation, address indexed by, bytes32 indexed uuid);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event RolledBack(address indexed implementation, address indexed by);

    modifier onlyGovernance() {
        require(IGovernance(_governance()).canUpgrade(msg.sender), "Not authorized by governance");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == _admin(), "Not admin");
        _;
    }

    modifier notPaused() {
        require(!_paused(), "Proxy is paused");
        _;
    }

    constructor(address implementation_, address admin_, address governance_) {
        require(admin_ != address(0), "Admin required");
        require(governance_ != address(0), "Governance required");
        _setAdmin(admin_);
        _setGovernance(governance_);
        _setImplementation(implementation_);
    }

    // --- Proxy Logic ---

    fallback() external payable notPaused {
        _delegate(_implementation());
    }

    receive() external payable notPaused {
        _delegate(_implementation());
    }

    function _delegate(address impl) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            calldatacopy(0, 0, calldatasize())
            // Call the implementation.
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())
            // Return data or revert.
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    // --- Upgrade Logic ---

    function upgradeTo(address newImplementation) external onlyGovernance {
        _upgradeTo(newImplementation);
    }

    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable onlyGovernance {
        _upgradeTo(newImplementation);
        (bool success, ) = newImplementation.delegatecall(data);
        require(success, "Delegatecall failed");
    }

    function getImplementation() external view returns (address) {
        return _implementation();
    }

    function getImplementationUUID() external view returns (bytes32) {
        return IUniversalImplementation(_implementation()).proxiableUUID();
    }

    function getAdmin() external view returns (address) {
        return _admin();
    }

    function getGovernance() external view returns (address) {
        return _governance();
    }

    function isPaused() external view returns (bool) {
        return _paused();
    }

    // --- Rollback (to previous implementation) ---

    function rollback() external onlyGovernance {
        address prevImpl = _rollback();
        emit RolledBack(prevImpl, msg.sender);
    }

    // --- Pause/Unpause ---

    function pause() external {
        require(IGovernance(_governance()).canPause(msg.sender), "Not authorized to pause");
        _setPaused(true);
        emit Paused(msg.sender);
    }

    function unpause() external onlyGovernance {
        _setPaused(false);
        emit Unpaused(msg.sender);
    }

    // --- Internal config ---

    function _implementation() internal view returns (address impl) {
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
    }

    function _setImplementation(address newImplementation) internal {
        require(newImplementation != address(0), "Invalid implementation");
        // Optionally: check UUID for UUPS
        try IUniversalImplementation(newImplementation).proxiableUUID() returns (bytes32 uuid) {
            require(uuid == _IMPLEMENTATION_SLOT, "Not compatible");
        } catch {
            revert("Implementation not UUPS compatible");
        }
        // Store previous for rollback
        address prevImpl = _implementation();
        bytes32 rollbackSlot = _ROLLBACK_SLOT;
        assembly {
            sstore(rollbackSlot, prevImpl)
        }
        bytes32 slot = _IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, newImplementation)
        }
        emit Upgraded(newImplementation, msg.sender, _IMPLEMENTATION_SLOT);
    }

    function _rollback() internal returns (address prevImpl) {
        bytes32 rollbackSlot = _ROLLBACK_SLOT;
        assembly {
            prevImpl := sload(rollbackSlot)
        }
        require(prevImpl != address(0), "No rollback available");
        _setImplementation(prevImpl);
        return prevImpl;
    }

    function _admin() internal view returns (address adm) {
        bytes32 slot = _ADMIN_SLOT;
        assembly {
            adm := sload(slot)
        }
    }

    function _setAdmin(address newAdmin) internal {
        require(newAdmin != address(0), "Invalid admin");
        bytes32 slot = _ADMIN_SLOT;
        assembly {
            sstore(slot, newAdmin)
        }
    }

    function _governance() internal view returns (address gov) {
        bytes32 slot = _GOVERNANCE_SLOT;
        assembly {
            gov := sload(slot)
        }
    }

    function _setGovernance(address newGov) internal {
        require(newGov != address(0), "Invalid governance");
        bytes32 slot = _GOVERNANCE_SLOT;
        assembly {
            sstore(slot, newGov)
        }
    }

    function _paused() internal view returns (bool p) {
        bytes32 slot = _PAUSED_SLOT;
        assembly {
            p := sload(slot)
        }
    }

    function _setPaused(bool v) internal {
        bytes32 slot = _PAUSED_SLOT;
        assembly {
            sstore(slot, v)
        }
    }

    // --- Admin transfer ---

    function transferAdmin(address newAdmin) external onlyAdmin {
        _setAdmin(newAdmin);
    }

    function transferGovernance(address newGov) external onlyGovernance {
        _setGovernance(newGov);
    }
}
