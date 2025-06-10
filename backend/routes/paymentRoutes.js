// backend/routes/paymentRoutes.js

const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/authMiddleware'); // Assuming you have an authentication middleware
const { validate } = require('uuid'); // For transaction ID validation
const logger = require('../config/logger'); // Assuming you have a logger

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authenticate);

/**
 * @route POST /api/payment/convert
 * @desc Converts Pi to Fiat currency.
 * @access Authenticated users
 */
router.post('/convert', PaymentController.convertPiToFiat);

/**
 * @route POST /api/payment/pay
 * @desc Processes a payment using traditional fiat currency.
 * @access Authenticated users
 */
router.post('/pay', PaymentController.processPayment);

/**
 * @route POST /api/payment/purchase
 * @desc Handles the purchase of an item using either Pi or Fiat.
 * @access Authenticated users
 */
router.post('/purchase', PaymentController.purchaseItem);

/**
 * @route GET /api/payment/validate/:transactionId
 * @desc Validates a transaction ID.
 * @access Authenticated users
 */
router.get('/validate/:transactionId',
    (req, res, next) => { // Inline middleware for transactionId validation
        const { transactionId } = req.params;
        if (!transactionId) {
            logger.warn(`User ${req.user.id} - Missing transaction ID for validation.`);
            return res.status(400).json({ message: 'Transaction ID is required.' });
        }

        if (!validate(transactionId)) { // Use uuid package for UUID validation
            logger.warn(`User ${req.user.id} - Invalid transaction ID format: ${transactionId}`);
            return res.status(400).json({ message: 'Invalid transaction ID format.' });
        }
        next(); // Proceed to the controller if validation passes
    },
    PaymentController.validateTransaction
);


// Error handling middleware (example - you might have a global error handler)
router.use((err, req, res, next) => {
    logger.error(`Payment route error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ message: 'An error occurred while processing your request.' });
});

module.exports = router;
