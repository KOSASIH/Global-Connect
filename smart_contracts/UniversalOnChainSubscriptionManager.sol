// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title UniversalOnChainSubscriptionManager
/// @notice Modular, unstoppable subscription/payment manager for ERC20/native. Supports plugin-based metering, NFT gating, usage oracles, and open membership. DAO/SaaS/DeFi ready.
/// @author KOSASIH
/// @custom:security-contact security@global-connect.org

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMeteringPlugin {
    function canSubscribe(address user, uint256 planId, bytes calldata data) external view returns (bool);
    function onRenew(address user, uint256 planId, uint256 period) external returns (bool);
}

contract UniversalOnChainSubscriptionManager is Ownable {
    enum SubscriptionStatus { Active, Cancelled, Expired }

    struct Plan {
        address creator;
        string name;
        string metadataURI;
        IERC20 token; // address(0) = native
        uint256 pricePerPeriod;
        uint256 periodSeconds;
        address meteringPlugin;
        bool active;
        uint256 createdAt;
    }

    struct Subscription {
        address user;
        uint256 planId;
        uint256 start;
        uint256 expiry;
        SubscriptionStatus status;
        uint256 periodsPaid;
    }

    uint256 public planCount;
    mapping(uint256 => Plan) public plans;

    mapping(address => mapping(uint256 => Subscription)) public subscriptions; // user => planId => Subscription

    event PlanCreated(uint256 indexed planId, address indexed creator, string name, string metadataURI, address token, uint256 pricePerPeriod, uint256 periodSeconds, address meteringPlugin);
    event PlanStatusChanged(uint256 indexed planId, bool active);
    event Subscribed(address indexed user, uint256 indexed planId, uint256 start, uint256 expiry, uint256 periodsPaid);
    event Renewed(address indexed user, uint256 indexed planId, uint256 newExpiry, uint256 periodsPaid);
    event Cancelled(address indexed user, uint256 indexed planId);

    // --- Plan Management ---

    function createPlan(
        string calldata name,
        string calldata metadataURI,
        address token,
        uint256 pricePerPeriod,
        uint256 periodSeconds,
        address meteringPlugin
    ) external returns (uint256 planId) {
        require(bytes(name).length > 0, "No name");
        require(pricePerPeriod > 0, "Zero price");
        require(periodSeconds > 0, "Zero period");
        planId = planCount++;
        plans[planId] = Plan({
            creator: msg.sender,
            name: name,
            metadataURI: metadataURI,
            token: IERC20(token),
            pricePerPeriod: pricePerPeriod,
            periodSeconds: periodSeconds,
            meteringPlugin: meteringPlugin,
            active: true,
            createdAt: block.timestamp
        });
        emit PlanCreated(planId, msg.sender, name, metadataURI, token, pricePerPeriod, periodSeconds, meteringPlugin);
    }

    function setPlanStatus(uint256 planId, bool active) external {
        require(msg.sender == plans[planId].creator || msg.sender == owner(), "No permission");
        plans[planId].active = active;
        emit PlanStatusChanged(planId, active);
    }

    // --- Subscribe & Renew ---

    function subscribe(uint256 planId, uint256 periods, bytes calldata pluginData) external payable {
        Plan storage p = plans[planId];
        require(p.active, "Inactive plan");
        require(periods > 0, "Zero periods");
        require(address(p.token) == address(0) ? msg.value == p.pricePerPeriod * periods : msg.value == 0, "ETH mismatch");

        if (p.meteringPlugin != address(0)) {
            require(IMeteringPlugin(p.meteringPlugin).canSubscribe(msg.sender, planId, pluginData), "Metering blocked");
        }

        uint256 start = block.timestamp;
        uint256 expiry = start + p.periodSeconds * periods;

        // Payment
        if (address(p.token) != address(0)) {
            require(p.token.transferFrom(msg.sender, p.creator, p.pricePerPeriod * periods), "ERC20 payment failed");
        } else if (msg.value > 0) {
            payable(p.creator).transfer(msg.value);
        }

        Subscription storage s = subscriptions[msg.sender][planId];
        s.user = msg.sender;
        s.planId = planId;
        s.start = start;
        s.expiry = expiry;
        s.status = SubscriptionStatus.Active;
        s.periodsPaid += periods;

        if (p.meteringPlugin != address(0)) {
            require(IMeteringPlugin(p.meteringPlugin).onRenew(msg.sender, planId, periods), "Plugin renewal fail");
        }

        emit Subscribed(msg.sender, planId, start, expiry, s.periodsPaid);
    }

    function renew(uint256 planId, uint256 periods, bytes calldata pluginData) external payable {
        Plan storage p = plans[planId];
        Subscription storage s = subscriptions[msg.sender][planId];
        require(s.status == SubscriptionStatus.Active, "Not active");
        require(periods > 0, "Zero periods");
        require(address(p.token) == address(0) ? msg.value == p.pricePerPeriod * periods : msg.value == 0, "ETH mismatch");

        if (p.meteringPlugin != address(0)) {
            require(IMeteringPlugin(p.meteringPlugin).canSubscribe(msg.sender, planId, pluginData), "Metering blocked");
        }

        // Payment
        if (address(p.token) != address(0)) {
            require(p.token.transferFrom(msg.sender, p.creator, p.pricePerPeriod * periods), "ERC20 payment failed");
        } else if (msg.value > 0) {
            payable(p.creator).transfer(msg.value);
        }

        s.expiry += p.periodSeconds * periods;
        s.periodsPaid += periods;

        if (p.meteringPlugin != address(0)) {
            require(IMeteringPlugin(p.meteringPlugin).onRenew(msg.sender, planId, periods), "Plugin renewal fail");
        }

        emit Renewed(msg.sender, planId, s.expiry, s.periodsPaid);
    }

    function cancel(uint256 planId) external {
        Subscription storage s = subscriptions[msg.sender][planId];
        require(s.status == SubscriptionStatus.Active, "Not active");
        s.status = SubscriptionStatus.Cancelled;
        emit Cancelled(msg.sender, planId);
    }

    // --- View ---

    function getPlan(uint256 planId) external view returns (
        address creator,
        string memory name,
        string memory metadataURI,
        address token,
        uint256 pricePerPeriod,
        uint256 periodSeconds,
        address meteringPlugin,
        bool active,
        uint256 createdAt
    ) {
        Plan storage p = plans[planId];
        return (
            p.creator,
            p.name,
            p.metadataURI,
            address(p.token),
            p.pricePerPeriod,
            p.periodSeconds,
            p.meteringPlugin,
            p.active,
            p.createdAt
        );
    }

    function getSubscription(address user, uint256 planId) external view returns (
        address subscriber,
        uint256 plan,
        uint256 start,
        uint256 expiry,
        SubscriptionStatus status,
        uint256 periodsPaid
    ) {
        Subscription storage s = subscriptions[user][planId];
        return (
            s.user,
            s.planId,
            s.start,
            s.expiry,
            s.status,
            s.periodsPaid
        );
    }
}
