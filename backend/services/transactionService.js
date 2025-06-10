// backend/services/transactionService.js

const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');
const UserService = require('./userService'); // Assuming you have a userService

class TransactionService {
    /**
     * Creates a new transaction.
     * @param {object} transactionData - The transaction data.
     * @param {string} transactionData.fromUserId - The ID of the user sending the funds.
     * @param {string} transactionData.toUserId - The ID of the user receiving the funds.
     * @param {number} transactionData.amount - The amount of Pi to transfer.
     * @param {string} transactionData.description - A description of the transaction.
     * @param {string} transactionData.type - The type of transaction (e.g., 'pi_transfer', 'fiat_payment').
     * @returns {Promise<{id: string, fromUserId: string, toUserId: string, amount: number, description: string, timestamp: Date}>} The newly created transaction.
     * @throws {Error} If the user is not found or has insufficient funds.
     */
    static async createTransaction(transactionData) {
        logger.info(`Creating transaction: ${JSON.stringify(transactionData)}`);

        try {
            const { fromUserId, toUserId, amount, description, type } = transactionData;

            // 1. Check if the sender exists
            const fromUser = await UserService.getUserById(fromUserId);
            if (!fromUser) {
                logger.warn(`Sender not found: ${fromUserId}`);
                throw { name: 'UserNotFoundError', message: 'Sender not found.' };
            }

            // 2. Check if the receiver exists
            const toUser = await UserService.getUserById(toUserId);
            if (!toUser) {
                logger.warn(`Receiver not found: ${toUserId}`);
                throw { name: 'UserNotFoundError', message: 'Receiver not found.' };
            }

            // 3. Check if the sender has sufficient funds
            if (fromUser.piBalance < amount) {
                logger.warn(`Insufficient funds for user ${fromUserId}.`);
                throw { name: 'InsufficientFundsError', message: 'Insufficient funds.' };
            }

            // 4. Update user balances (atomically - this is CRITICAL)
            await UserService.transferPi(fromUserId, toUserId, amount);

            // 5. Create the transaction (in a real implementation, you would save this to a database)
            const transaction = {
                id: uuidv4(),
                fromUserId: fromUserId,
                toUserId: toUserId,
                amount: amount,
                description: description,
                timestamp: new Date(),
                type: type
            };

            logger.info(`Successfully created transaction ${transaction.id}.`);
            return transaction;

        } catch (error) {
            logger.error(`Error creating transaction: ${error.message}`, { stack: error.stack });
            throw error; // Re-throw the error for the controller to handle
        }
    }

    /**
     * Gets a transaction by ID.
     * @param {string} transactionId - The ID of the transaction.
     * @returns {Promise<{id: string, fromUserId: string, toUserId: string, amount: number, description: string, timestamp: Date} | null>} The transaction, or null if it doesn't exist.
     */
    static async getTransactionById(transactionId) {
        logger.debug(`Getting transaction by ID: ${transactionId}.`);

        // Replace with actual database query
        // This is just a placeholder
        return null;
    }

    /**
     * Gets all transactions for a specific user, with pagination and filtering.
     * @param {object} filter - The filter object.
     * @param {string} filter.userId - The ID of the user.
     * @param {string} [filter.type] - The optional transaction type to filter by.
     * @param {number} page - The page number.
     * @param {number} limit - The number of transactions per page.
     * @returns {Promise<{transactions: Array<{id: string, fromUserId: string, toUserId: string, amount: number, description: string, timestamp: Date}>, totalCount: number}>} An object containing the transactions and the total count.
     */
    static async getUserTransactions(filter, page, limit) {
        logger.debug(`Getting user transactions for user ${filter.userId}. Page: ${page}, Limit: ${limit}, Filter: ${JSON.stringify(filter)}`);

        try {
            const { userId, type } = filter;

            // Replace with actual database query with pagination and filtering
            const transactions = [
                { id: uuidv4(), fromUserId: userId, toUserId: uuidv4(), amount: 10, description: 'Test transaction', timestamp: new Date(), type: 'pi_transfer' },
                { id: uuidv4(), fromUserId: uuidv4(), toUserId: userId, amount: 5, description: 'Test transaction', timestamp: new Date(), type: 'pi_transfer' },
            ];

            const totalCount = 20; // Replace with actual total count from the database

            logger.info(`Successfully retrieved ${transactions.length} transactions for user ${userId}.`);
            return { transactions, totalCount };

        } catch (error) {
            logger.error(`Error getting user transactions: ${error.message}`, { stack: error.stack });
            throw error; // Re-throw the error for the controller to handle
        }
    }
}

module.exports = TransactionService;
