// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title PermissionlessInsuranceRegistry
/// @notice Unstoppable, permissionless insurance registry for DAOs, DeFi, NFT, and Web3. Modular risk, oracle, and claims plugins. Pools, claims, and event-driven transparency.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IRiskPlugin {
    function isCovered(uint256 policyId) external view returns (bool);
    function premium(uint256 policyId, uint256 amount, uint256 duration) external view returns (uint256);
}

interface IOraclePlugin {
    function checkEvent(uint256 policyId) external view returns (bool);
}

interface IClaimsPlugin {
    function submitClaim(uint256 policyId, address claimant, string calldata evidenceURI) external;
    function settleClaim(uint256 policyId, address claimant) external returns (bool approved, uint256 payout);
}

contract PermissionlessInsuranceRegistry is Ownable {
    enum PolicyStatus { Active, Expired, ClaimSubmitted, ClaimSettled, Cancelled }

    struct Policy {
        address creator;
        string metadataURI; // Off-chain policy terms, e.g., IPFS
        IERC20 token;       // address(0) = native
        uint256 insuredAmount;
        uint256 premiumPaid;
        uint256 start;
        uint256 end;
        PolicyStatus status;
        address riskPlugin;
        address oraclePlugin;
        address claimsPlugin;
        address underwriter;
        address insured;
        address claimant;
        string evidenceURI;
        uint256 createdAt;
        uint256 claimAt;
        uint256 settledAt;
        uint256 payout;
    }

    uint256 public policyCount;
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;

    event PolicyCreated(uint256 indexed policyId, address indexed creator, address indexed insured, address token, uint256 insuredAmount, uint256 premium, address riskPlugin, address oraclePlugin, address claimsPlugin);
    event PolicyUnderwritten(uint256 indexed policyId, address indexed underwriter);
    event PolicyPurchased(uint256 indexed policyId, address indexed buyer);
    event ClaimSubmitted(uint256 indexed policyId, address indexed claimant, string evidenceURI);
    event ClaimSettled(uint256 indexed policyId, address indexed claimant, uint256 payout, bool approved);
    event PolicyCancelled(uint256 indexed policyId);

    modifier policyExists(uint256 policyId) {
        require(policyId < policyCount, "No such policy");
        _;
    }
    modifier onlyCreator(uint256 policyId) {
        require(msg.sender == policies[policyId].creator, "Not creator");
        _;
    }

    // --- Policy Creation ---

    function createPolicy(
        string memory metadataURI,
        address token,
        uint256 insuredAmount,
        uint256 duration,
        address riskPlugin,
        address oraclePlugin,
        address claimsPlugin,
        address insured
    ) external payable returns (uint256 policyId) {
        require(insuredAmount > 0, "Zero insured");
        require(duration > 0, "Zero duration");
        require(riskPlugin != address(0), "No risk plugin");
        require(claimsPlugin != address(0), "No claims plugin");
        require(insured != address(0), "No insured");

        policyId = policyCount++;
        Policy storage p = policies[policyId];
        p.creator = msg.sender;
        p.metadataURI = metadataURI;
        p.token = IERC20(token);
        p.insuredAmount = insuredAmount;
        p.status = PolicyStatus.Active;
        p.riskPlugin = riskPlugin;
        p.oraclePlugin = oraclePlugin;
        p.claimsPlugin = claimsPlugin;
        p.insured = insured;
        p.createdAt = block.timestamp;
        p.start = block.timestamp;
        p.end = block.timestamp + duration;

        userPolicies[insured].push(policyId);

        // Premium calculation and payment
        uint256 premium = IRiskPlugin(riskPlugin).premium(policyId, insuredAmount, duration);
        p.premiumPaid = premium;
        if (token == address(0)) {
            require(msg.value == premium, "ETH premium mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(IERC20(token).transferFrom(msg.sender, address(this), premium), "ERC20 premium failed");
        }

        emit PolicyCreated(policyId, msg.sender, insured, token, insuredAmount, premium, riskPlugin, oraclePlugin, claimsPlugin);
    }

    // --- Underwrite Policy (Pool/Fund) ---

    function underwritePolicy(uint256 policyId) external payable policyExists(policyId) {
        Policy storage p = policies[policyId];
        require(p.underwriter == address(0), "Already underwritten");
        if (address(p.token) == address(0)) {
            require(msg.value == p.insuredAmount, "ETH fund mismatch");
        } else {
            require(msg.value == 0, "No ETH for ERC20");
            require(p.token.transferFrom(msg.sender, address(this), p.insuredAmount), "ERC20 fund failed");
        }
        p.underwriter = msg.sender;
        emit PolicyUnderwritten(policyId, msg.sender);
    }

    // --- Purchase Policy (by insured) ---

    function purchasePolicy(uint256 policyId) external policyExists(policyId) {
        Policy storage p = policies[policyId];
        require(msg.sender == p.insured, "Not insured");
        require(p.status == PolicyStatus.Active, "Not active");
        emit PolicyPurchased(policyId, msg.sender);
    }

    // --- Claim Submission ---

    function submitClaim(uint256 policyId, string calldata evidenceURI) external policyExists(policyId) {
        Policy storage p = policies[policyId];
        require(msg.sender == p.insured, "Not insured");
        require(p.status == PolicyStatus.Active || p.status == PolicyStatus.Expired, "Not claimable");
        require(block.timestamp <= p.end, "Policy expired");
        p.status = PolicyStatus.ClaimSubmitted;
        p.claimant = msg.sender;
        p.evidenceURI = evidenceURI;
        p.claimAt = block.timestamp;
        IClaimsPlugin(p.claimsPlugin).submitClaim(policyId, msg.sender, evidenceURI);
        emit ClaimSubmitted(policyId, msg.sender, evidenceURI);
    }

    // --- Claim Settlement (by plugin) ---

    function settleClaim(uint256 policyId, address claimant) external policyExists(policyId) {
        Policy storage p = policies[policyId];
        require(msg.sender == p.claimsPlugin, "Not claims plugin");
        require(p.status == PolicyStatus.ClaimSubmitted, "No claim submitted");
        (bool approved, uint256 payout) = IClaimsPlugin(p.claimsPlugin).settleClaim(policyId, claimant);
        p.settledAt = block.timestamp;
        p.payout = payout;
        p.status = PolicyStatus.ClaimSettled;
        if (approved && payout > 0) {
            if (address(p.token) == address(0)) {
                payable(claimant).transfer(payout);
            } else {
                p.token.transfer(claimant, payout);
            }
        }
        emit ClaimSettled(policyId, claimant, payout, approved);
    }

    // --- Cancel Policy (by creator, if not underwritten) ---

    function cancelPolicy(uint256 policyId) external policyExists(policyId) onlyCreator(policyId) {
        Policy storage p = policies[policyId];
        require(p.underwriter == address(0), "Already underwritten");
        p.status = PolicyStatus.Cancelled;
        // Refund premium
        if (address(p.token) == address(0)) {
            payable(p.creator).transfer(p.premiumPaid);
        } else {
            p.token.transfer(p.creator, p.premiumPaid);
        }
        emit PolicyCancelled(policyId);
    }

    // --- View Functions ---

    function getPolicy(uint256 policyId) external view policyExists(policyId) returns (
        address creator,
        string memory metadataURI,
        address token,
        uint256 insuredAmount,
        uint256 premiumPaid,
        uint256 start,
        uint256 end,
        PolicyStatus status,
        address riskPlugin,
        address oraclePlugin,
        address claimsPlugin,
        address underwriter,
        address insured,
        address claimant,
        string memory evidenceURI,
        uint256 createdAt,
        uint256 claimAt,
        uint256 settledAt,
        uint256 payout
    ) {
        Policy storage p = policies[policyId];
        return (
            p.creator,
            p.metadataURI,
            address(p.token),
            p.insuredAmount,
            p.premiumPaid,
            p.start,
            p.end,
            p.status,
            p.riskPlugin,
            p.oraclePlugin,
            p.claimsPlugin,
            p.underwriter,
            p.insured,
            p.claimant,
            p.evidenceURI,
            p.createdAt,
            p.claimAt,
            p.settledAt,
            p.payout
        );
    }

    function policiesOf(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }
}
