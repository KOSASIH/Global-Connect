// backend/api/authenticity.js
const express = require('express');
const AuthenticityService = require('../services/authenticityService');
const router = express.Router();

// Validate Pi authenticity
router.post('/validate', async (req, res) => {
    const { transactionId } = req.body;
    try {
        const validationResult = await AuthenticityService.validateTransaction(transactionId);
        res.json(validationResult);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
