// backend/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/authMiddleware'); // Assuming you have authentication middleware
const { validateCreateTransaction } = require('../middleware/transactionValidationMiddleware'); // Validation middleware

/**
 * @route POST /api/transactions
 * @desc Create a new transaction (e.g., for buying an NFT). Requires authentication.
 * @access Private
 */
router.post('/', authenticate, validateCreateTransaction, TransactionController.createTransaction);

/**
 * @route GET /api/transactions/:transactionId
 * @desc Get a transaction by ID. Requires authentication (to view own transactions or admin).
 * @access Private (User or Admin)
 */
router.get('/:transactionId', authenticate, TransactionController.getTransaction);

/**
 * @route GET /api/transactions
 * @desc List all transactions (with optional filtering and pagination). Requires authentication and admin privileges.
 * @access Private (Admin only)
 */
router.get('/', authenticate, TransactionController.listTransactions);

/**
 * @route GET /api/transactions/user/:userId
 * @desc Get all transactions for a specific user. Requires authentication (to view own transactions or admin).
 * @access Private (User or Admin)
 */
router.get('/user/:userId', authenticate, TransactionController.getUserTransactions);

/**
 * @route POST /api/transactions/:transactionId/confirm
 * @desc Confirm a transaction (e.g., after blockchain confirmation). Requires authentication and potentially specific roles.
 * @access Private (Potentially specific roles, e.g., system account)
 */
router.post('/:transactionId/confirm', authenticate, TransactionController.confirmTransaction);

module.exports = router;
