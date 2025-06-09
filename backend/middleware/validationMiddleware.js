// backend/middleware/validationMiddleware.js
const Joi = require('joi');

// Example schema for user registration
const userRegistrationSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
});

// Example schema for transaction creation
const transactionSchema = Joi.object({
    destination: Joi.string().required(),
    amount: Joi.number().positive().required(),
    assetCode: Joi.string().required(),
});

// Middleware for validating user registration
const validateUserRegistration = (req, res, next) => {
    const { error } = userRegistrationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

// Middleware for validating transaction creation
const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = {
    validateUserRegistration,
    validateTransaction,
};
