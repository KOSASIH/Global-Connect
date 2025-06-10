// backend/controllers/analyticsController.js

const AnalyticsService = require('../services/analyticsService');
const UserService = require('../services/userService'); // Assuming you have a userService
const { isPositiveNumber } = require(// backend/controllers/analyticsController.js

const AnalyticsService = require('../services/analyticsService');
const UserService = require('../services/userService'); // Assuming you have a userService
const { isPositiveNumber } = require('../utils/validation');
const logger = require('../config/logger');

class AnalyticsController {
    /**
     * Gets user activity data for a specific user. Requires authentication and authorization (e.g., users can only view their own activity or admins can view all).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserActivity(req, res) {
        const userId = req.params.userId; // Get user ID from the route parameters
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting activity data for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId) {
                logger.warn(`User ${requestingUserId} - Missing userId in getUserActivity request.`);
                return res.status(400).json({ message: 'User ID is required.' });
            }

            // 2. Authorization Check (Example: Users can only view their own activity or admins can view all)
            if (userId !== requestingUserId && !(req.user && req.user.isAdmin)) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view activity data for user ${userId}.`);
                return res.status(403).json({ message: 'Unauthorized to view activity data for this user.' });
            }

            // 3. Get User Activity (Using AnalyticsService)
            const activityData = await AnalyticsService.getUserActivity(userId);

            // 4. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved activity data for user ${userId}.`);

            // 5. Response
            res.status(200).json({ activityData: activityData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting user activity data: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get user activity data. Please try again later.' });
        }
    }

    /**
     * Gets platform-wide analytics data. Requires authentication and authorization (e.g., only admins can view platform analytics).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getPlatformAnalytics(req, res) {
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting platform analytics data.`);

        try {
            // 1. Authorization Check (Example: Only admins can view platform analytics)
            const requestingUser = await UserService.getUserById(requestingUserId);
            if (!requestingUser || !requestingUser.isAdmin) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view platform analytics.`);
                return res.status(403).json({ message: 'Unauthorized to view platform analytics.' });
            }

            // 2. Get Platform Analytics (Using AnalyticsService)
            const analyticsData = await AnalyticsService.getPlatformAnalytics();

            // 3. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved platform analytics data.`);

            // 4. Response
            res.status(200).json({ analyticsData: analyticsData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting platform analytics data: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get platform analytics data. Please try again later.' });
        }
    }

    /**
     * Gets a summary dashboard for a user.  This might include recent transactions, NFT holdings, loyalty points, etc.
     * Requires authentication and authorization (users can only view their own dashboard or admins can view all).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserDashboard(req, res) {
        const userId = req.params.userId; // Get user ID from the route parameters
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting dashboard data for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId) {
                logger.warn(`User ${requestingUserId} - Missing userId in getUserDashboard request.`);
                return res.status(400).json({ message: 'User ID is required.' });
            }

            // 2. Authorization Check (Example: Users can only view their own dashboard or admins can view all)
            if (userId !== requestingUserId && !(req.user && req.user.isAdmin)) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view dashboard data for user ${userId}.`);
                return res.status(403).json({ message: 'Unauthorized to view dashboard data for this user.' });
            }

            // 3. Get User Dashboard Data (Using AnalyticsService)
            const dashboardData = await AnalyticsService.getUserDashboard(userId);

            // 4. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved dashboard data for user ${userId}.`);

            // 5. Response
            res.status(200).json({ dashboardData: dashboardData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting user dashboard data: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get user dashboard data. Please try again later.' });
        }
    }

    /**
     * Tracks a user event.  This endpoint is used to record user actions for analytics purposes.
     * No authentication required (but you might want to identify the user if possible).
     * @param {Request} req - Express request object.  Expects eventName and optional eventData in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async trackEvent(req, res) {
        const userId = req.user ? req.user.id : 'anonymous'; // Try to get the user ID if authenticated
        const { eventName, eventData } = req.body;

        logger.info(`Tracking event "${eventName}" for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!eventName) {
                logger.warn(`Missing eventName in trackEvent request.`);
                return res.status(400).json({ message: 'Event name is required.' });
            }

            // 2. Track Event (Using AnalyticsService)
            await AnalyticsService.trackEvent(userId, eventName, eventData);

            // 3. Response
            res.status(204).send(); // 204 No Content - successful, but no content to return

        } catch (error) {
            logger.error(`Error tracking event: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to track event. Please try again later.' });
        }
    }
}

module.exports = AnalyticsController;
'../utils/validation');
const logger = require('../config/logger');

class AnalyticsController {
    /**
     * Gets user activity data for a specific user. Requires authentication and authorization (e.g., users can only view their own activity or admins can view all).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserActivity(req, res) {
        const userId = req.params.userId; // Get user ID from the route parameters
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting activity data for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId) {
                logger.warn(`User ${requestingUserId} - Missing userId in getUserActivity request.`);
                return res.status(400).json({ message: 'User ID is required.' });
            }

            // 2. Authorization Check (Example: Users can only view their own activity or admins can view all)
            if (userId !== requestingUserId && !(req.user && req.user.isAdmin)) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view activity data for user ${userId}.`);
                return res.status(403).json({ message: 'Unauthorized to view activity data for this user.' });
            }

            // 3. Get User Activity (Using AnalyticsService)
            const activityData = await AnalyticsService.getUserActivity(userId);

            // 4. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved activity data for user ${userId}.`);

            // 5. Response
            res.status(200).json({ activityData: activityData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting user activity data: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get user activity data. Please try again later.' });
        }
    }

    /**
     * Gets platform-wide analytics data. Requires authentication and authorization (e.g., only admins can view platform analytics).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getPlatformAnalytics(req, res) {
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting platform analytics data.`);

        try {
            // 1. Authorization Check (Example: Only admins can view platform analytics)
            const requestingUser = await UserService.getUserById(requestingUserId);
            if (!requestingUser || !requestingUser.isAdmin) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view platform analytics.`);
                return res.status(403).json({ message: 'Unauthorized to view platform analytics.' });
            }

            // 2. Get Platform Analytics (Using AnalyticsService)
            const analyticsData = await AnalyticsService.getPlatformAnalytics();

            // 3. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved platform analytics data.`);

            // 4. Response
            res.status(200).json({ analyticsData: analyticsData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting platform analytics data: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get platform analytics data. Please try again later.' });
        }
    }

    /**
     * Gets a summary dashboard for a user.  This might include recent transactions, NFT holdings, loyalty points, etc.
     * Requires authentication and authorization (users can only view their own dashboard or admins can view all).
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserDashboard(req, res) {
        const userId = req.params.userId; // Get user ID from the route parameters
        const requestingUserId = req.user.id; // ID of the user making the request

        logger.info(`User ${requestingUserId} requesting dashboard data for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!userId) {
                logger.warn(`User ${requestingUserId} - Missing userId in getUserDashboard request.`);
                return res.status(400).json({ message: 'User ID is required.' });
            }

            // 2. Authorization Check (Example: Users can only view their own dashboard or admins can view all)
            if (userId !== requestingUserId && !(req.user && req.user.isAdmin)) {
                logger.warn(`User ${requestingUserId} - Unauthorized attempt to view dashboard data for user ${userId}.`);
                return res.status(403).json({ message: 'Unauthorized to view dashboard data for this user.' });
            }

            // 3. Get User Dashboard Data (Using AnalyticsService)
            const dashboardData = await AnalyticsService.getUserDashboard(userId);

            // 4. Audit Logging
            logger.info(`User ${requestingUserId} successfully retrieved dashboard data for user ${userId}.`);

            // 5. Response
            res.status(200).json({ dashboardData: dashboardData });

        } catch (error) {
            logger.error(`User ${requestingUserId} - Error getting user dashboard data: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get user dashboard data. Please try again later.' });
        }
    }

    /**
     * Tracks a user event.  This endpoint is used to record user actions for analytics purposes.
     * No authentication required (but you might want to identify the user if possible).
     * @param {Request} req - Express request object.  Expects eventName and optional eventData in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async trackEvent(req, res) {
        const userId = req.user ? req.user.id : 'anonymous'; // Try to get the user ID if authenticated
        const { eventName, eventData } = req.body;

        logger.info(`Tracking event "${eventName}" for user ${userId}.`);

        try {
            // 1. Input Validation
            if (!eventName) {
                logger.warn(`Missing eventName in trackEvent request.`);
                return res.status(400).json({ message: 'Event name is required.' });
            }

            // 2. Track Event (Using AnalyticsService)
            await AnalyticsService.trackEvent(userId, eventName, eventData);

            // 3. Response
            res.status(204).send(); // 204 No Content - successful, but no content to return

        } catch (error) {
            logger.error(`Error tracking event: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to track event. Please try again later.' });
        }
    }
}

module.exports = AnalyticsController;
