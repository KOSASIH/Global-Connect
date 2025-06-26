// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @title Recurring, OneTime }
    enum SubscriptionStatus { Inactive, Active, Cancelled, Expired }

    struct Plan {
        string name;
        PlanType planType;
        IERC20 token; // address(0) = native
        uint256 price;
        uint256 billingPeriod; // seconds (for recurring), 0 for one-time
        address pricingPlugin;
        address accessPlugin;
        bool active;
    }

    struct Subscription {
        uint256 planId;
        address subscriber;
        SubscriptionStatus status;
        uint256 start;
        uint256 end;
        uint256 lastPaid;
    }

    uint256 public planRecurring) {
            require(billingPeriod > 0, "Invalid period");
        }
        planId = planCount++;
        plans[planId] = Plan({
            name: name,
            planType: planType,
            token: IERC20(token),
            price: price,
            billingPeriod: billingPeriod,
            pricingPlugin: pricingPlugin,
            accessPlugin: accessPlugin,
            active: true
        });
        emit PlanCreated(planId, name, planType, token, price, billingPeriod, pricingPlugin, accessPlugin);
    }

    function set, now_, end_, price);
        return true;
    }

    function renew(uint256 planId) external payable returns (bool) {
        Plan storage p = plans[planId];
        Subscription storage s = subscriptions[msg.sender][planId];
        require(p.active, "Not active");
        require(p.planType == PlanType.Recurring, "Not recurring");
        require(s.status == SubscriptionStatus.Active || s.status == SubscriptionStatus.Expired, "Not renewable");

        uint256 price = end,
        uint256 lastPaid
    ) {
        Subscription storage s = subscriptions[user][planId];
        return (s.status, s.start, s.end, s.lastPaid);
    }
}
