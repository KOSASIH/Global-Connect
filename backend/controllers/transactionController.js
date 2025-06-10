// backend/controllers/transactionController.js

const TransactionService = require('../services/transactionService');
const UserService = require('../services/userService'); // Assuming you have a userService
const { validate } = require('uuid'); // For transaction ID validation
const { isPositiveNumber } = require('../utils/validation'); // Custom validation utility
const logger = require('../config/logger'); // Assuming you have a logger

class TransactionController {
    /**
     * Creates a new transaction.  This endpoint is for internal transactions within the platform
     * (e.g., transferring Pi from one user to another).  External transactions (e.g., payments)
     * should be handled by the PaymentController.
     * @param {Request} req - Express request object.  Expects toUserId, amount, and description in the request body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async createTransaction(req, res) {
        const fromUserId = req.user.id; // ID of the user initiating the transaction
        const { toUserId, amount, description } = req.body;

        logger.info(`User ${fromUserId} attempting to create transaction to user ${toUserId} with amount ${amount}.`);

        try {
            // 1. Input Validation
            if (!toUserId || !amount) {
                logger.warn(`User ${fromUserId} - Missing toUserId or amount in createTransaction request.`);
                return res.status(400).json({ message: 'To User ID and amount are required.' });
            }

            if (!isPositiveNumber(amount)) {
                logger.warn(`User ${fromUserId} - Invalid amount (${amount}) in createTransaction request.`);
                return res.status(400).json({ message: 'Amount must be a positive number.' });
            }

            if (fromUserId === toUserId) {
                logger.warn(`User ${fromUserId} - Attempting to send money to themselves.`);
                return res.status(400).json({ message: 'Cannot send money to yourself.' });
            }

            // 2. Authorization Check (Example: Users can only send money from their own account)
            // This is implicitly checked by using req.user.id as the fromUserId

            // 3. Transaction Logic (Using TransactionService)
            const transaction = await TransactionService.createTransaction({
                fromUserId: fromUserId,
                toUserId: toUserId,
                amount: amount,
                description: description || 'Pi transfer', // Use provided description or default
                type: 'pi_transfer' // Distinguish from fiat transactions
            });

            // 4. Audit Logging
            logger.info(`User ${fromUserId} successfully created transaction ${transaction.id} to user ${toUserId} with amount ${amount}.`);

            // 5. Response
            res.status(201).json({ message: 'Transaction created successfully', transaction: transaction });

        } catch (error) {
            logger.error(`User ${fromUserId} - Error creating transaction: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient funds.' });
            } else if (error.name === 'UserNotFoundError') {
                return res.status(404).json({ message: 'User not found.' });
            }

            res.status(500).json({ message: 'Failed to create transaction. Please try again later.' });
        }
    }

    /**
     * Gets a transaction by ID.  Requires authentication and authorization.
     * @param {Request} req - Express request object.  Expects transactionId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getTransaction(req, res) {
        const userId = req.user.id;
        const { transactionId } = req.params;

        logger.info(`User ${userId} requesting transaction ${transactionId}.`);

        try {
            // 1. Input Validation
            if (!transactionId) {
                logger.warn(`User ${userId} - Missing transactionId in getTransaction request.`);
                return res.status(400).json({ message: 'Transaction ID is required.' });
            }

            if (!validate(transactionId)) { // Use uuid package for UUID validation
                logger.warn(`User ${userId} - Invalid transaction ID format: ${transactionId}`);
                return res.status(400).json({ message: 'Invalid transaction ID format.' });
            }

            // 2. Transaction Retrieval (Using TransactionService)
            const transaction = await TransactionService.getTransactionById(transactionId);

            if (!transaction) {
                logger.warn(`User ${userId} - Transaction not found: ${transactionId}`);
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            // 3. Authorization Check (Ensure user is involved in the transaction)
            if (transaction.fromUserId !== userId && transaction.toUserId !== userId) {
                logger.warn(`User ${userId} - Unauthorized attempt to access transaction ${transactionId}.`);
                return res.status(403).json({ message: 'Unauthorized to access this transaction.' }); // 403 Forbidden
            }

            // 4. Audit Logging
            logger.info(`User ${userId} successfully retrieved transaction ${transactionId}.`);

            // 5. Response
            res.status(200).json({ transaction: transaction });

        } catch (error) {
            logger.error(`User ${userId} - Error getting transaction: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get transaction. Please try again later.' });
        }
    }

    /**
     * Gets all transactions for a specific user.  Supports pagination and filtering.
     * @param {Request} req - Express request object.  Supports optional query parameters: page, limit, type.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async getUserTransactions(req, res) {
        const userId = req.user.id;
        const { page = 1, limit = 10, type } = req.query; // Default pagination values

        logger.info(`User ${userId} requesting transactions. Page: ${page}, Limit: ${limit}, Type: ${type}`);

        try {
            // 1. Input Validation (Sanitize and validate pagination parameters)
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber < 1) {
                logger.warn(`User ${userId} - Invalid page number: ${page}`);
                return res.status(400).json({ message: 'Invalid page number.' });
            }

            if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) { // Limit the maximum page size
                logger.warn(`User ${userId} - Invalid limit: ${limit}`);
                return res.status(400).json({ message: 'Invalid limit. Must be between 1 and 100.' });
            }

            const filter = {
                userId: userId, // Filter transactions for the current user
                type: type // Optional transaction type filter
            };

            // 2. Transaction Retrieval (Using TransactionService)
            const { transactions, totalCount } = await TransactionService.getUserTransactions(filter, pageNumber, limitNumber);

            // 3. Audit Logging
            logger.info(`User ${userId} successfully retrieved ${transactions.length} transactions.`);

            // 4. Response (Include pagination metadata)
            res.status(200).json({
                transactions: transactions,
                page: pageNumber,
                limit: limitNumber,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / limitNumber) // Calculate total pages
            });

        } catch (error) {
            logger.error(`User ${userId} - Error getting user transactions: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Failed to get user transactions. Please try again later.' });
        }
    }
}

module.exports = TransactionController;
