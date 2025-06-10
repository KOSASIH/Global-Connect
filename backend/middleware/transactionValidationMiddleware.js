// backend/middleware/transactionValidationMiddleware.js

const { body, param, validationResult } = require('express-validator');
const { isPositiveNumber } = require('../utils/validation'); // Assuming you have a utility for validating positive numbers
const logger = require('../config/logger'); // Assuming you have a logger

// Validation middleware for creating a transaction
const validateCreateTransaction = [
    body('type')
        .isIn(['buy', 'sell', 'transfer', 'mint', 'reward'])
        .withMessage('Type must be buy, sell, transfer, mint, or reward'),

    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom(value => {
            if (!isPositiveNumber(value)) {
                throw new Error('Amount must be a positive number');
            }
            return true;
        }),

    body('senderId')
        .optional({ nullable: true }) // Allow null for mint/reward transactions
        .isUUID()
        .withMessage('Sender ID must be a valid UUID')
        .bail() // Stop further validation if senderId is invalid
        .custom((value, { req }) => {
            if (req.body.type === 'mint' || req.body.type === 'reward') {
                if (value !== null && value !== undefined) {
                    throw new Error('Sender ID must be null for mint/reward transactions');
                }
            } else if (!value) {
                throw new Error('Sender ID is required for buy/sell/transfer transactions');
            }
            return true;
        }),

    body('receiverId')
        .isUUID()
        .withMessage('Receiver ID must be a valid UUID'),

    body('nftId')
        .optional({ nullable: true }) // Allow null for non-NFT transactions
        .isUUID()
        .withMessage('NFT ID must be a valid UUID')
        .bail() // Stop further validation if nftId is invalid
        .custom((value, { req }) => {
            if (req.body.type === 'buy' || req.body.type === 'sell' || req.body.type === 'transfer') {
                if (!value) {
                    throw new Error('NFT ID is required for buy/sell/transfer transactions');
                }
            } else if (value !== null && value !== undefined) {
                throw new Error('NFT ID must be null for mint/reward transactions');
            }
            return true;
        }),

    body('description')
        .optional()
        .isString()
        .trim()
        .escape()
        .isLength({ max: 255 })
        .withMessage('Description must be a string and no more than 255 characters'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn(`Validation errors in createTransaction: ${JSON.stringify(errors.array())}`);
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for getting a transaction by ID
const validateGetTransaction = [
    param('transactionId')
        .isUUID()
        .withMessage('Transaction ID must be a valid UUID'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.warn(`Validation errors in getTransaction: ${JSON.stringify(errors.array())}`);
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateTransaction,
    validateGetTransaction
};
