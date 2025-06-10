// backend/controllers/paymentController.js

const PaymentService = require('../services/paymentService');
const UserService = require('../services/userService'); // Assuming you have a userService
const TransactionService = require('../services/transactionService'); // Assuming you have a transactionService
const { validate } = require('uuid'); // For transaction ID validation
const { isPositiveNumber } = require('../utils/validation'); // Custom validation utility

const logger = require('../config/logger'); // Assuming you have a logger

class PaymentController {
    /**
     * Converts Pi to Fiat currency.  Handles validation, rate limiting, and error handling.
     * @param {Request} req - Express request object.  Expects amount (Pi) and currency (ISO code) in body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async convertPiToFiat(req, res) {
        const userId = req.user.id; // Assuming user ID is attached to the request via middleware
        const { amount, currency } = req.body;

        logger.info(`User ${userId} requested Pi to Fiat conversion: Amount=${amount}, Currency=${currency}`);

        try {
            // 1. Input Validation (Robust)
            if (!amount || !currency) {
                logger.warn(`User ${userId} - Missing amount or currency in Pi to Fiat conversion request.`);
                return res.status(400).json({ message: 'Amount and currency are required.' });
            }

            if (!isPositiveNumber(amount)) {
                logger.warn(`User ${userId} - Invalid amount (${amount}) in Pi to Fiat conversion request.`);
                return res.status(400).json({ message: 'Amount must be a positive number.' });
            }

            if (currency.length !== 3) { // Basic ISO currency code validation
                logger.warn(`User ${userId} - Invalid currency code (${currency}) in Pi to Fiat conversion request.`);
                return res.status(400).json({ message: 'Invalid currency code.' });
            }

            // 2. Rate Limiting (Example - Implement a proper rate limiting mechanism)
            // This is a placeholder.  Use Redis or a similar solution for production.
            const userConversionCount = await PaymentService.getUserConversionCount(userId);
            if (userConversionCount > 5) { // Example: Limit to 5 conversions per day
                logger.warn(`User ${userId} - Rate limit exceeded for Pi to Fiat conversion.`);
                return res.status(429).json({ message: 'Too many conversion requests. Please try again later.' });
            }

            // 3. Conversion Logic (Using PaymentService)
            const conversionResult = await PaymentService.convertPiToFiat(amount, currency, userId);

            // 4. Audit Logging (Detailed)
            logger.info(`User ${userId} - Pi to Fiat conversion successful: Amount=${amount}, Currency=${currency}, FiatAmount=${conversionResult.fiatAmount}`);

            // 5. Response
            res.status(200).json(conversionResult);

        } catch (error) {
            logger.error(`User ${userId} - Error in Pi to Fiat conversion: ${error.message}`, { stack: error.stack });

            // 6. Error Handling (Specific and Graceful)
            if (error.name === 'ExternalAPIError') {
                return res.status(502).json({ message: 'Error communicating with external payment service.' });
            } else if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient Pi funds for conversion.' });
            }

            res.status(500).json({ message: 'Conversion failed. Please try again later.' });
        }
    }


    /**
     * Processes a payment using traditional fiat currency.  Handles transaction recording,
     * fraud detection (placeholder), and integration with payment gateway.
     * @param {Request} req - Express request object.  Expects amount, currency, and paymentMethod in body.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async processPayment(req, res) {
        const userId = req.user.id; // Assuming user ID is attached to the request via middleware
        const { amount, currency, paymentMethod, description } = req.body; // Added description

        logger.info(`User ${userId} initiated payment: Amount=${amount}, Currency=${currency}, Method=${paymentMethod}`);

        try {
            // 1. Input Validation (Comprehensive)
            if (!amount || !currency || !paymentMethod) {
                logger.warn(`User ${userId} - Missing payment details.`);
                return res.status(400).json({ message: 'Amount, currency, and payment method are required.' });
            }

            if (!isPositiveNumber(amount)) {
                logger.warn(`User ${userId} - Invalid payment amount: ${amount}`);
                return res.status(400).json({ message: 'Amount must be a positive number.' });
            }

            // Validate currency code (ISO 4217)
            if (currency.length !== 3) {
                logger.warn(`User ${userId} - Invalid currency code: ${currency}`);
                return res.status(400).json({ message: 'Invalid currency code.' });
            }

            // Validate payment method (whitelist approach)
            const allowedPaymentMethods = ['credit_card', 'paypal', 'bank_transfer']; // Define allowed methods
            if (!allowedPaymentMethods.includes(paymentMethod)) {
                logger.warn(`User ${userId} - Invalid payment method: ${paymentMethod}`);
                return res.status(400).json({ message: 'Invalid payment method.' });
            }

            // 2. Fraud Detection (Placeholder - Implement a real fraud detection system)
            // This is a placeholder.  Integrate with a fraud detection service like Sift Science or similar.
            const isFraudulent = await PaymentService.detectFraudulentTransaction(userId, amount, paymentMethod);
            if (isFraudulent) {
                logger.warn(`User ${userId} - Potential fraudulent transaction detected.`);
                return res.status(403).json({ message: 'Transaction declined due to potential fraud.' }); // 403 Forbidden
            }

            // 3. Process Payment (Using PaymentService)
            const paymentResult = await PaymentService.processPayment(amount, currency, paymentMethod, userId);

            // 4. Record Transaction (Detailed)
            const transactionData = {
                userId: userId,
                amount: amount,
                currency: currency,
                paymentMethod: paymentMethod,
                transactionId: paymentResult.transactionId, // From payment gateway
                status: 'completed', // Or 'pending', 'failed' based on paymentResult
                description: description || 'Payment via traditional currency', // Use provided description or default
                type: 'fiat_payment' // Distinguish from Pi transactions
            };

            const transaction = await TransactionService.createTransaction(transactionData);

            // 5. User Update (Example - Update user balance or payment history)
            await UserService.updateUserPaymentHistory(userId, transaction.id);

            // 6. Audit Logging (Comprehensive)
            logger.info(`User ${userId} - Payment processed successfully. Transaction ID: ${paymentResult.transactionId}`);

            // 7. Response
            res.status(200).json({ message: 'Payment successful', transactionId: paymentResult.transactionId });

        } catch (error) {
            logger.error(`User ${userId} - Error processing payment: ${error.message}`, { stack: error.stack });

            // 8. Error Handling (Specific and Graceful)
            if (error.name === 'PaymentGatewayError') {
                return res.status(502).json({ message: 'Error communicating with payment gateway.' });
            } else if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient funds in payment account.' });
            }

            res.status(500).json({ message: 'Payment failed. Please try again later.' });
        }
    }


    /**
     * Handles the purchase of an item using either Pi or Fiat.  This is a unified purchase endpoint.
     * @param {Request} req - Express request object.  Expects itemId, amount, currency (Pi or Fiat), and paymentMethod (optional for Pi)
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async purchaseItem(req, res) {
        const userId = req.user.id;
        const { itemId, amount, currency, paymentMethod } = req.body;

        logger.info(`User ${userId} attempting to purchase item ${itemId} with ${amount} ${currency}`);

        try {
            // 1. Input Validation
            if (!itemId || !amount || !currency) {
                logger.warn(`User ${userId} - Missing purchase details.`);
                return res.status(400).json({ message: 'Item ID, amount, and currency are required.' });
            }

            if (!isPositiveNumber(amount)) {
                logger.warn(`User ${userId} - Invalid purchase amount: ${amount}`);
                return res.status(400).json({ message: 'Amount must be a positive number.' });
            }

            const allowedCurrencies = ['PI', 'USD', 'EUR']; // Extend as needed
            if (!allowedCurrencies.includes(currency.toUpperCase())) {
                logger.warn(`User ${userId} - Invalid currency: ${currency}`);
                return res.status(400).json({ message: 'Invalid currency.' });
            }

            // 2. Determine Payment Type and Process Accordingly
            let transactionResult;
            if (currency.toUpperCase() === 'PI') {
                // Purchase with Pi
                transactionResult = await PaymentService.processPiPurchase(userId, itemId, amount);
            } else {
                // Purchase with Fiat
                if (!paymentMethod) {
                    logger.warn(`User ${userId} - Payment method required for fiat purchase.`);
                    return res.status(400).json({ message: 'Payment method is required for fiat purchases.' });
                }
                transactionResult = await PaymentService.processFiatPurchase(userId, itemId, amount, currency, paymentMethod);
            }

            // 3. Record Transaction (Unified)
            const transactionData = {
                userId: userId,
                itemId: itemId,
                amount: amount,
                currency: currency,
                paymentMethod: paymentMethod || 'Pi', // Default to Pi if applicable
                transactionId: transactionResult.transactionId,
                status: 'completed',
                description: `Purchase of item ${itemId}`,
                type: currency.toUpperCase() === 'PI' ? 'pi_purchase' : 'fiat_purchase'
            };

            const transaction = await TransactionService.createTransaction(transactionData);

            // 4. Audit Logging
            logger.info(`User ${userId} - Purchase of item ${itemId} successful. Transaction ID: ${transactionResult.transactionId}`);

            // 5. Response
            res.status(200).json({ message: 'Purchase successful', transactionId: transaction.id });


        } catch (error) {
            logger.error(`User ${userId} - Error processing purchase: ${error.message}`, { stack: error.stack });

            // 6. Error Handling
            if (error.name === 'InsufficientFundsError') {
                return res.status(400).json({ message: 'Insufficient funds.' });
            } else if (error.name === 'ItemNotFoundError') {
                return res.status(404).json({ message: 'Item not found.' });
            }

            res.status(500).json({ message: 'Purchase failed. Please try again later.' });
        }
    }


    /**
     * Validates a transaction ID.  This is a critical security function.
     * @param {Request} req - Express request object.  Expects transactionId in the request parameters.
     * @param {Response} res - Express response object.
     * @returns {Promise<void>}
     */
    static async validateTransaction(req, res) {
        const userId = req.user.id;
        const { transactionId } = req.params;

        logger.info(`User ${userId} requesting validation of transaction ${transactionId}`);

        try {
            // 1. Input Validation (Strict)
            if (!transactionId) {
                logger.warn(`User ${userId} - Missing transaction ID for validation.`);
                return res.status(400).json({ message: 'Transaction ID is required.' });
            }

            if (!validate(transactionId)) { // Use uuid package for UUID validation
                logger.warn(`User ${userId} - Invalid transaction ID format: ${transactionId}`);
                return res.status(400).json({ message: 'Invalid transaction ID format.' });
            }

            // 2. Retrieve Transaction (Using TransactionService)
            const transaction = await TransactionService.getTransactionById(transactionId);

            if (!transaction) {
                logger.warn(`User ${userId} - Transaction not found: ${transactionId}`);
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            // 3. Authorization Check (Ensure user owns the transaction)
            if (transaction.userId !== userId) {
                logger.warn(`User ${userId} - Attempt to validate transaction belonging to another user: ${transactionId}`);
                return res.status(403).json({ message: 'Unauthorized to validate this transaction.' }); // 403 Forbidden
            }

            // 4. Validation Logic (Example - Check with payment gateway)
            const isValid = await PaymentService.verifyTransactionWithGateway(transactionId);

            // 5. Audit Logging
            logger.info(`User ${userId} - Transaction ${transactionId} validation result: ${isValid}`);

            // 6. Response
            res.status(200).json({ isValid: isValid });

        } catch (error) {
            logger.error(`User ${userId} - Error validating transaction ${transactionId}: ${error.message}`, { stack: error.stack });
            res.status(500).json({ message: 'Transaction validation failed. Please try again later.' });
        }
    }
}

module.exports = PaymentController;
