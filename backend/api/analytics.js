// backend/api/analytics.js
const express = require('express');
const TransactionService = require('../services/transactionService');
const router = express.Router();

// Get total transaction count
router.get('/transaction-count', async (req, res) => {
    try {
        const totalCount = await TransactionService.getTransactionCount();
        res.json({ totalTransactionCount: totalCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get total transaction amount
router.get('/total-transaction-amount', async (req, res) => {
    try {
        const totalAmount = await TransactionService.getTotalTransactionAmount();
        res.json({ totalTransactionAmount: totalAmount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user transaction history
router.get('/user-history/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const userTransactions = await TransactionService.getTransactionHistory(username);
        res.json(userTransactions);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

// Get asset distribution
router.get('/asset-distribution', async (req, res) => {
    try {
        const assetDistribution = await TransactionService.getAssetDistribution();
        res.json(assetDistribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
