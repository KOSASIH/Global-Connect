// backend/controllers/educationController.js

const EducationService = require('../services/educationService');
const UserService = require('../services/userService'); // Assuming you have a userService
const { isPositiveNumber } = require('../utils/validation');
const logger = require('../config/logger');

class EducationController {
    /**
     * Creates a new learning module. Requires authentication and authorization (e.g., only admins can create modules).
     * @param {Request} req - Express request object. Expects title, description, content, and pointsAwarded in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async createLearningModule(req, res) {
        const creatorId = req.user.id; // ID of the user creating the module (e.g., admin)
        const { title, description, content, pointsAwarded } = req.body;

        logger.info(`User ${creatorId} attempting to create learning module with title ${title}.`);

        try {
            // 1. Input Validation
            if (!title || !description || !content || !pointsAwarded) {
                logger.warn(`User ${creatorId} - Missing learning module creation details.`);
                return res.status(400).json({ message: 'Title, description, content, and points awarded are required.' });
            }

            if (!isPositiveNumber(pointsAwarded)) {
                logger.warn(`User ${creatorId} - Invalid points awarded value: ${pointsAwarded}`);
                return res.status(400).json({ message: 'Points awarded must be a positive number.' });
            }

            // 2. Authorization Check (Example: Only admins can create modules)
            const creator = await UserService.getUserById(creatorId);
            if (!creator || !creator.isAdmin) {
                logger.warn(`User ${creatorId} - Unauthorized attempt to create learning module.`);
                return res.status(403).json({ message: 'Unauthorized to create learning modules.' }); // 403 Forbidden
            }

            // 3. Learning Module Creation Logic (Using EducationService)
            const module = await EducationService.createLearningModule({
                title: title,
                description: description,
                content: content,
                pointsAwarded: pointsAwarded,
                creatorId: creatorId
            });

            // 4. Audit Logging
            logger.info(`User ${creatorId} successfully created learning module ${module.id} with title ${title}.`);

            // 5. Response
            res.status(201).json({ message: 'Learning module created successfully', module: module });

        } catch (error) {
            logger.error(`User ${creatorId} - Error creating learning module: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to create learning module. Please try again later.' });
        }
    }

    /**
     * Gets a learning module by ID. No authentication required (modules are publicly viewable).
     * @param {Request} req - Express request object. Expects moduleId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getLearningModule(req, res) {
        const { moduleId } = req.params;

        logger.info(`Requesting learning module with ID ${moduleId}.`);

        try {
            // 1. Input Validation
            if (!moduleId) {
                logger.warn(`Missing moduleId in getLearningModule request.`);
                return res.status(400).json({ message: 'Module ID is required.' });
            }

            // 2. Learning Module Retrieval (Using EducationService)
            const module = await EducationService.getLearningModuleById(moduleId);

            if (!module) {
                logger.warn(`Learning module not found: ${moduleId}`);
                return res.status(404).json({ message: 'Learning module not found.' });
            }

            // 3. Response
            res.status(200).json({ module: module });

        } catch (error) {
            logger.error(`Error getting learning module: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get learning module. Please try again later.' });
        }
    }

    /**
     * Lists all learning modules. Supports pagination and filtering (e.g., by creator).
     * @param {Request} req - Express request object. Supports optional query parameters: page, limit, creatorId.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async listLearningModules(req, res) {
        const { page = 1, limit = 10, creatorId } = req.query; // Default pagination values

        logger.info(`Listing learning modules. Page: ${page}, Limit: ${limit}, Creator: ${creatorId}`);

        try {
            // 1. Input Validation (Sanitize and validate pagination parameters)
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber < 1) {
                logger.warn(`Invalid page number: ${page}`);
                return res.status(400).json({ message: 'Invalid page number.' });
            }

            if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) { // Limit the maximum page size
                logger.warn(`Invalid limit: ${limit}`);
                return res.status(400).json({ message: 'Invalid limit. Must be between 1 and 100.' });
            }

            const filter = {
                creatorId: creatorId
            };

            // 2. Learning Module Retrieval (Using EducationService)
            const { modules, totalCount } = await EducationService.listLearningModules(filter, pageNumber, limitNumber);

            // 3. Audit Logging
            logger.info(`Successfully retrieved ${modules.length} learning modules.`);

            // 4. Response (Include pagination metadata)
            res.status(200).json({
                modules: modules,
                page: pageNumber,
                limit: limitNumber,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber) // Calculate total pages
            });

        } catch (error) {
            logger.error(`Error listing learning modules: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to list learning modules. Please try again later.' });
        }
    }

    /**
     * Completes a learning module for a user. Requires authentication.
     * @param {Request} req - Express request object. Expects moduleId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async completeLearningModule(req, res) {
        const userId = req.user.id;
        const { moduleId } = req.params;

        logger.info(`User ${userId} attempting to complete learning module ${moduleId}.`);

        try {
            // 1. Input Validation
            if (!moduleId) {
                logger.warn(`User ${userId} - Missing moduleId in completeLearningModule request.`);
                return res.status(400).json({ message: 'Module ID is required.' });
            }

            // 2. Completion Logic (Using EducationService)
            const completionResult = await EducationService.completeLearningModule(userId, moduleId);

            // 3. Audit Logging
            logger.info(`User ${userId} successfully completed learning module ${moduleId}. Points awarded: ${completionResult.pointsAwarded}`);

            // 4. Response
            res.status(200).json({ message: 'Learning module completed successfully', completion: completionResult });

        } catch (error) {
            logger.error(`User ${userId} - Error completing learning module: ${error.message}`, { stack: error.stack });

            // 5. Error Handling
            if (error.name === 'ModuleNotFoundError') {
                return res.status(404).json({ message: 'Learning module not found.' });
            } else if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            } else if (error.name === 'ModuleAlreadyCompletedError') {
                return res.status(400).json({ message: 'Learning module already completed.' });
            }

            res.status(500).json({ message: 'Failed to complete learning module. Please try again later.' });
        }
    }

    /**
     * Gets all completed learning modules for a specific user. Requires authentication.
     * @param {Request} req - Express request object.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserCompletedModules(req, res) {
        const userId = req.user.id;

        logger.info(`User ${userId} requesting completed learning modules.`);

        try {
            // 1. Get Completed Modules (Using EducationService)
            const completedModules = await EducationService.getUserCompletedModules(userId);

            // 2. Audit Logging
            logger.info(`User ${userId} successfully retrieved completed learning modules.`);

            // 3. Response
            res.status(200).json({ completedModules: completedModules });

        } catch (error) {
            logger.error(`User ${userId} - Error getting completed learning modules: ${error.message}`, { stack: error.stack });

            // 4. Error Handling
            if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to get completed learning modules. Please try again later.' });
        }
    }
}

module.exports = EducationController;
