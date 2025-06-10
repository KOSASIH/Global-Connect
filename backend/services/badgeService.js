// backend/services/badgeService.js

const winston = require('winston'); // For logging
const { BadRequestError } = require('../errors'); // Custom error class for handling bad requests
const CoinModel = require('../models/Coin'); // Mongoose model for coins

// Define badge types
const Badge = {
    PURE: '🌟',
    EXCHANGE: '💱'
};

/**
 * Validates if the provided coin is a pure Pi Coin.
 * @param {Object} coin - The coin object to validate.
 * @param {string} coin.badge - The badge of the coin.
 * @param {number} coin.value - The value of the coin.
 * @returns {Promise<boolean>} - Returns true if the coin is a pure Pi Coin, otherwise false.
 */
const isPurePiCoin = async (coin) => {
    if (!coin || typeof coin !== 'object') {
        throw new BadRequestError('Invalid coin object provided.');
    }

    const { badge, value } = coin;

    // Log the validation process
    winston.info(`Validating coin: Badge - ${badge}, Value - ${value}`);

    // Check if the coin has the correct badge and value
    const isValid = badge === Badge.PURE && value === 314159;

    if (!isValid) {
        winston.warn(`Coin validation failed: Badge - ${badge}, Value - ${value}`);
    } else {
        winston.info('Coin validation succeeded.');
    }

    // Optionally, save the coin to the database for record-keeping
    await saveCoin(coin);

    return isValid;
};

/**
 * Saves the coin to the database.
 * @param {Object} coin - The coin object to save.
 */
const saveCoin = async (coin) => {
    try {
        const newCoin = new CoinModel(coin);
        await newCoin.save();
        winston.info('Coin saved to database successfully.');
    } catch (error) {
        winston.error('Error saving coin to database:', error);
    }
};

module.exports = {
    isPurePiCoin,
    Badge
};
