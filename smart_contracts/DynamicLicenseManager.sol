// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title DynamicLicenseManager
/// @notice Modular, unstoppable, programmable license management for software, content, and Web3 IP. Supports ERC721/1155 licenses, plugins, audit trails, and dynamic terms.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ILicensePlugin {
    function onAssign(uint256 licenseId, address user) external;
    function onRevoke(uint256 licenseId, address user) external;
    function isValid(uint256 licenseId, address user) external view returns (bool);
}

contract DynamicLicenseManager is Ownable, ERC721Enumerable, ERC1155 {
    enum LicenseType { ERC721, ERC1155 }
    enum LicenseStatus { Active, Revoked, Expired }

    struct License {
        LicenseType licenseType;
        string name;
        string termsURI;         // Off-chain or on-chain terms (IPFS, Arweave, or HTTP)
        address issuedTo;
        uint256 issuedAt;
        uint256 expiresAt;
        LicenseStatus status;
        address plugin;
        string extraData;
    }

    uint256 public nextLicenseId;
    mapping(uint256 => License) public licenses; // licenseId => License

    event LicenseMinted(uint256 indexed licenseId, LicenseType licenseType, address indexed issuedTo, uint256 expiresAt, address plugin, string termsURI);
    event LicenseAssigned(uint256 indexed licenseId, address indexed user);
    event LicenseTransferred(uint256 indexed licenseId, address indexed from, address indexed to);
    event LicenseRevoked(uint256 indexed licenseId, address indexed by);
    event LicenseExpired(uint256 indexed licenseId);
    event PluginSet(uint256 indexed licenseId, address plugin);

    constructor(string memory _uri)
        ERC721("DynamicLicense721", "DL721")
        ERC1155(_uri)
    {}

    // --- Mint/Issue License ---

    function mintERC721License(
        address to,
        string memory name,
        string memory termsURI,
        uint256 expiresAt,
        address plugin,
        string memory extraData
    ) external onlyOwner returns (uint256 licenseId) {
        licenseId = nextLicenseId++;
        _mint(to, licenseId);
        licenses[licenseId] = License(
            LicenseType.ERC721, name, termsURI, to, block.timestamp,
            expiresAt, LicenseStatus.Active, plugin, extraData
        );
        if (plugin != address(0)) ILicensePlugin(plugin).onAssign(licenseId, to);
        emit LicenseMinted(licenseId, LicenseType.ERC721, to, expiresAt, plugin, termsURI);
        emit LicenseAssigned(licenseId, to);
    }

    function mintERC1155License(
        address to,
        uint256 amount,
        string memory name,
        string memory termsURI,
        uint256 expiresAt,
        address plugin,
        string memory extraData
    ) external onlyOwner returns (uint256 licenseId) {
        licenseId = nextLicenseId++;
        _mint(to, licenseId, amount, "");
        licenses[licenseId] = License(
            LicenseType.ERC1155, name, termsURI, to, block.timestamp,
            expiresAt, LicenseStatus.Active, plugin, extraData
        );
        if (plugin != address(0)) ILicensePlugin(plugin).onAssign(licenseId, to);
        emit LicenseMinted(licenseId, LicenseType.ERC1155, to, expiresAt, plugin, termsURI);
        emit LicenseAssigned(licenseId, to);
    }

    // --- Transfer/Assign License ---

    function transferERC721License(uint256 licenseId, address to) external {
        require(ownerOf(licenseId) == msg.sender, "Not license owner");
        _transfer(msg.sender, to, licenseId);
        licenses[licenseId].issuedTo = to;
        if (licenses[licenseId].plugin != address(0)) {
            ILicensePlugin(licenses[licenseId].plugin).onAssign(licenseId, to);
        }
        emit LicenseTransferred(licenseId, msg.sender, to);
        emit LicenseAssigned(licenseId, to);
    }

    function safeTransferERC1155License(uint256 licenseId, address to, uint256 amount) external {
        require(balanceOf(msg.sender, licenseId) >= amount, "Insufficient license balance");
        safeTransferFrom(msg.sender, to, licenseId, amount, "");
        if (licenses[licenseId].plugin != address(0)) {
            ILicensePlugin(licenses[licenseId].plugin).onAssign(licenseId, to);
        }
        emit LicenseTransferred(licenseId, msg.sender, to);
        emit LicenseAssigned(licenseId, to);
    }

    // --- Revoke/Expire License ---

    function revokeLicense(uint256 licenseId) external onlyOwner {
        License storage l = licenses[licenseId];
        require(l.status == LicenseStatus.Active, "Not active");
        l.status = LicenseStatus.Revoked;
        if (l.plugin != address(0)) ILicensePlugin(l.plugin).onRevoke(licenseId, l.issuedTo);
        emit LicenseRevoked(licenseId, msg.sender);
    }

    function expireLicense(uint256 licenseId) external {
        License storage l = licenses[licenseId];
        require(l.status == LicenseStatus.Active, "Not active");
        require(l.expiresAt != 0 && block.timestamp > l.expiresAt, "Not expired");
        l.status = LicenseStatus.Expired;
        if (l.plugin != address(0)) ILicensePlugin(l.plugin).onRevoke(licenseId, l.issuedTo);
        emit LicenseExpired(licenseId);
    }

    // --- Plugin Management ---

    function setPlugin(uint256 licenseId, address plugin) external onlyOwner {
        licenses[licenseId].plugin = plugin;
        emit PluginSet(licenseId, plugin);
    }

    // --- View Functions ---

    function getLicense(uint256 licenseId) external view returns (
        LicenseType licenseType,
        string memory name,
        string memory termsURI,
        address issuedTo,
        uint256 issuedAt,
        uint256 expiresAt,
        LicenseStatus status,
        address plugin,
        string memory extraData
    ) {
        License storage l = licenses[licenseId];
        return (
            l.licenseType,
            l.name,
            l.termsURI,
            l.issuedTo,
            l.issuedAt,
            l.expiresAt,
            l.status,
            l.plugin,
            l.extraData
        );
    }

    function isLicenseValid(uint256 licenseId, address user) external view returns (bool) {
        License storage l = licenses[licenseId];
        if (l.status != LicenseStatus.Active) return false;
        if (l.expiresAt != 0 && block.timestamp > l.expiresAt) return false;
        if (l.plugin != address(0)) {
            return ILicensePlugin(l.plugin).isValid(licenseId, user);
        }
        if (l.licenseType == LicenseType.ERC721) {
            return ownerOf(licenseId) == user;
        } else {
            return balanceOf(user, licenseId) > 0;
        }
    }

    // --- ERC721/ERC1155 Overrides ---

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721Enumerable, ERC1155) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable, ERC1155)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
