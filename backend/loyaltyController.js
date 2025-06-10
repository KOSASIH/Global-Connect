// backend/controllers/loyaltyController.js

const LoyaltyService = require('../services/loyaltyService');
const UserService = require('../services/userService');
const { isPositiveNumber } = require('../utils/validation');
const logger = require('../config/logger');

class LoyaltyController {
    /**
     * Grants loyalty points to a user.  Requires authentication and authorization (e.g., only admins can grant points).
     * @param {Request} req - Express request object.  Expects userId and points in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async grantLoyaltyPoints(req, res) {
        const granterId = req.user.id; // ID of the user granting the points (e.g., admin)
        const { userId, points } = req.body;

        logger.info(`User ${granterId} attempting to grant ${points} loyalty points to user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId || !points) {
                logger.warn(`User ${granterId} - Missing userId or points in grantLoyaltyPoints request.`);
                return res.status(400).json({ message: 'User ID and points are required.' });
            }

            if (!isPositiveNumber(points)) {
                logger.warn(`User ${granterId} - Invalid points value: ${points}`);
                return res.status(400).json({ message: 'Points must be a positive number.' });
            }

            // 2. Authorization Check (Example: Only admins can grant points)
            const granter = await UserService.getUserById(granterId);
            if (!granter || !granter.isAdmin) {
                logger.warn(`User ${granterId} - Unauthorized attempt to grant loyalty points.`);
                return res.status(403).json({ message: 'Unauthorized to grant loyalty points.' }); // 403 Forbidden
            }

            // 3. Loyalty Point Granting Logic (Using LoyaltyService)
            const updatedUser = await LoyaltyService.grantLoyaltyPoints(userId, points);

            // 4. Audit Logging
            logger.info(`User ${granterId} successfully granted ${points} loyalty points to user ${userId}. New balance: ${updatedUser.loyaltyPoints}`);

            // 5. Response
            res.status(200).json({ message: 'Loyalty points granted successfully', user: updatedUser });

        } catch (error) {
            logger.error(`User ${granterId} - Error granting loyalty points: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to grant loyalty points. Please try again later.' });
        }
    }

    /**
     * Redeems loyalty points for a reward.  Requires authentication and sufficient points.
     * @param {Request} req - Express request object.  Expects rewardId in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async redeemLoyaltyPoints(req, res) {
        const userId = req.user.id;
        const { rewardId } = req.body;

        logger.info(`User ${userId} attempting to redeem loyalty points for reward ${rewardId}.`);

        try {
            // 1. Input Validation
            if (!rewardId) {
                logger.warn(`User ${userId} - Missing rewardId in redeemLoyaltyPoints request.`);
                return res.status(400).json({ message: 'Reward ID is required.' });
            }

            // 2. Redemption Logic (Using LoyaltyService)
            const redemptionResult = await LoyaltyService.redeemLoyaltyPoints(userId, rewardId);

            // 3. Audit Logging
            logger.info(`User ${userId} successfully redeemed loyalty points for reward ${rewardId}. New balance: ${redemptionResult.newBalance}`);

            // 4. Response
            res.status(200).json({ message: 'Loyalty points redeemed successfully', redemption: redemptionResult });

        } catch (error) {
            logger.error(`User ${userId} - Error redeeming loyalty points: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'InsufficientPointsError') {
                return res.status(400).json({ message: 'Insufficient loyalty points.' });
            } else if (error.name === 'RewardNotFoundError') {
                return res.status(404).json({ message: 'Reward not found.' });
            } else if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to redeem loyalty points. Please try again later.' });
        }
    }

    /**
     * Gets the loyalty point balance for a user.  Requires authentication.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getLoyaltyPointsBalance(req, res) {
        const userId = req.user.id;

        logger.info(`User ${userId} requesting loyalty point balance.`);

        try {
            // 1. Get Loyalty Point Balance (Using LoyaltyService)
            const user = await LoyaltyService.getLoyaltyPointsBalance(userId);

            // 2. Audit Logging
            logger.info(`User ${userId} successfully retrieved loyalty point balance: ${user.loyaltyPoints}`);

            // 3. Response
            res.status(200).json({ loyaltyPoints: user.loyaltyPoints });

        } catch (error) {
            logger.error(`User ${userId} - Error getting loyalty point balance: ${error.message}`, { stack: error.stack });

            // 4. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get loyalty point balance. Please try again later.' });
        }
    }

    /**
     * Lists available rewards.  No authentication required.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listRewards(req, res) {
        logger.info(`Listing available rewards.`);

        try {
            // 1. Get Rewards (Using LoyaltyService)
            const rewards = await LoyaltyService.listRewards();

            // 2. Audit Logging
            logger.info(`Successfully retrieved ${rewards.length} available rewards.`);

            // 3. Response
            res.status(200).json({ rewards: rewards });

        } catch (error) {
            logger.error(`Error listing rewards: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to list rewards. Please try again later.' });
        }
    }

    /**
     * Creates a new reward. Requires authentication and authorization (e.g., only admins can create rewards).
     * @param {Request} req - Express request object. Expects name, description, and pointsCost in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async createReward(req, res) {
        const creatorId = req.user.id; // ID of the user creating the reward (e.g., admin)
        const { name, description, pointsCost } = req.body;

        logger.info(`User ${creatorId} attempting to create reward with name ${name}.`);

        try {
            // 1. Input Validation
            if (!name || !description || !pointsCost) {
                logger.warn(`User ${creatorId} - Missing reward creation details.`);
                return res.status(400).json({ message: 'Name, description, and points cost are required.' });
            }

            if (!isPositiveNumber(pointsCost)) {
                logger.warn(`User ${creatorId} - Invalid points cost: ${pointsCost}`);
                return res.status(400).json({ message: 'Points cost must be a positive number.' });
            }

            // 2. Authorization Check (Example: Only admins can create rewards)
            const creator = await UserService.getUserById(creatorId);
            if (!creator || !creator.isAdmin) {
                logger.warn(`User ${creatorId} - Unauthorized attempt to create reward.`);
                return res.status(403).json({ message: 'Unauthorized to create rewards.' }); // 403 Forbidden
            }

            // 3. Reward Creation Logic (Using LoyaltyService)
            const reward = await LoyaltyService.createReward({
                name: name,
                description: description,
                pointsCost: pointsCost
            });

            // 4. Audit Logging
            logger.info(`User ${creatorId} successfully created reward ${reward.id} with name ${name}.`);

            // 5. Response
            res.status(201).json({ message: 'Reward created successfully', reward: reward });

        } catch (error) {
            logger.error(`User ${creatorId} - Error creating reward: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to create reward. Please try again later.' });
        }
    }
}

module.exports = LoyaltyController;
