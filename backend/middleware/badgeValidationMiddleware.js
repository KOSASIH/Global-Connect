// backend/middleware/badgeValidationMiddleware.js

const { body, param, validationResult } = require('express-validator');

// Validation middleware for creating a badge
const validateCreateBadge = [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('imageUrl').notEmpty().isURL().withMessage('Image URL is required and must be a valid URL'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation middleware for updating a badge
const validateUpdateBadge = [
    param('badgeId').isUUID().withMessage('Badge ID must be a valid UUID'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('imageUrl').optional().notEmpty().isURL().withMessage('Image URL must be a valid URL'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateBadge,
    validateUpdateBadge
};
