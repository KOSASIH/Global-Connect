// backend/controllers/badgeController.js

const BadgeService = require('../services/badgeService');
const UserService = require('../services/userService');
const { isPositiveNumber } = require('../utils/validation');
const logger = require('../config/logger');

class BadgeController {
    /**
     * Issues a badge to a user.  Handles validation, authorization, and badge issuance logic.
     * @param {Request} req - Express request object.  Expects userId and badgeName in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async issueBadge(req, res) {
        const issuerId = req.user.id; // ID of the user issuing the badge (e.g., admin)
        const { userId, badgeName } = req.body;

        logger.info(`User ${issuerId} attempting to issue badge ${badgeName} to user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId || !badgeName) {
                logger.warn(`User ${issuerId} - Missing userId or badgeName in issueBadge request.`);
                return res.status(400).json({ message: 'User ID and badge name are required.' });
            }

            // 2. Authorization Check (Example: Only admins can issue badges)
            const issuer = await UserService.getUserById(issuerId);
            if (!issuer || !issuer.isAdmin) {
                logger.warn(`User ${issuerId} - Unauthorized attempt to issue badge.`);
                return res.status(403).json({ message: 'Unauthorized to issue badges.' }); // 403 Forbidden
            }

            // 3. Badge Issuance Logic (Using BadgeService)
            const badge = await BadgeService.issueBadge(userId, badgeName);

            // 4. Audit Logging
            logger.info(`User ${issuerId} successfully issued badge ${badgeName} to user ${userId}.`);

            // 5. Response
            res.status(201).json({ message: 'Badge issued successfully', badge: badge });

        } catch (error) {
            logger.error(`User ${issuerId} - Error issuing badge: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'BadgeAlreadyIssuedError') {
                return res.status(409).json({ message: 'Badge already issued to this user.' }); // 409 Conflict
            } else if (error.name === 'BadgeNotFoundError') {
                return res.status(404).json({ message: 'Badge not found.' });
            } else if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to issue badge. Please try again later.' });
        }
    }

    /**
     * Validates a Pi Coin.  This is a complex operation that requires interacting with the Pi Network.
     * This is a placeholder and needs to be implemented with the actual Pi Network validation mechanism.
     * @param {Request} req - Express request object.  Expects piCoinData in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async validatePiCoin(req, res) {
        const userId = req.user.id;
        const { piCoinData } = req.body; // This will depend on how Pi coins are represented

        logger.info(`User ${userId} attempting to validate Pi Coin.`);

        try {
            // 1. Input Validation
            if (!piCoinData) {
                logger.warn(`User ${userId} - Missing piCoinData in validatePiCoin request.`);
                return res.status(400).json({ message: 'Pi Coin data is required.' });
            }

            // 2. Validation Logic (Using BadgeService)
            // **IMPORTANT:** This is a placeholder.  You MUST implement the actual Pi Network validation logic.
            const isValid = await BadgeService.validatePiCoin(piCoinData);

            // 3. Audit Logging
            logger.info(`User ${userId} - Pi Coin validation result: ${isValid}`);

            // 4. Response
            res.status(200).json({ isValid: isValid });

        } catch (error) {
            logger.error(`User ${userId} - Error validating Pi Coin: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Pi Coin validation failed. Please try again later.' });
        }
    }

    /**
     * Gets all badges for a specific user.
     * @param {Request} req - Express request object.  Expects userId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserBadges(req, res) {
        const userId = req.params.userId; // Get user ID from the route parameters
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting badges for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId) {
                logger.warn(`User ${requestingUserId} - Missing userId in getUserBadges request.`);
                return res.status(400).json({ message: 'User ID is required.' });
            }

            // 2. Authorization Check (Example: Users can only view their own badges or admins can view all)
            if (userId !== requestingUserId && !(req.user && req.user.isAdmin)) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view badges for user ${userId}.`);
                return res.status(403).json({ message: 'Unauthorized to view badges for this user.' });
            }

            // 3. Get Badges (Using BadgeService)
            const badges = await BadgeService.getUserBadges(userId);

            // 4. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved badges for user ${userId}.`);

            // 5. Response
            res.status(200).json({ badges: badges });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting user badges: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get user badges. Please try again later.' });
        }
    }
}

module.exports = BadgeController;
