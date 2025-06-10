// backend/services/badgeService.test.js

const { isPurePiCoin, Badge } = require('./badgeService');
const { BadRequestError } = require('../errors');

describe('Badge Service', () => {
    test('should validate a pure Pi Coin', async () => {
        const coin = { badge: Badge.PURE, value: 314159 };
        const result = await isPurePiCoin(coin);
        expect(result).toBe(true);
    });

    test('should invalidate a non-pure Pi Coin', async () => {
        const coin = { badge: Badge.EXCHANGE, value: 314159 };
        const result = await isPurePiCoin(coin);
        expect(result).toBe(false);
    });

    test('should throw an error for invalid coin object', async () => {
        await expect(isPurePiCoin(null)).rejects.toThrow(BadRequestError);
    });
});
