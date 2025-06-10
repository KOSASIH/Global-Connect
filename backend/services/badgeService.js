// backend/services/badgeService.js

const Badge = {
    PURE: '🌟',
    EXCHANGE: '💱'
};

const isPurePiCoin = (coin) => {
    return coin.badge === Badge.PURE && coin.value === 314159;
};

module.exports = {
    isPurePiCoin,
    Badge
};
