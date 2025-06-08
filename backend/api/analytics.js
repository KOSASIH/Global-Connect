// backend/api/analytics.js
const express = require('express');
const router = express.Router();

// In-memory transaction storage (for demonstration purposes)
const transactions = require('./transaction').transactions; // Import transactions from transaction.js

// Get total transaction count
router.get('/transaction-count', (req, res) => {
    const totalCount = transactions.length;
    res.json({ totalTransactionCount: totalCount });
});

// Get total transaction amount
router.get('/total-transaction-amount', (req, res) => {
    const totalAmount = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    res.json({ totalTransactionAmount: totalAmount });
});

// Get transaction history for a specific user
router.get('/user-history/:username', (req, res) => {
    const { username } = req.params;
    const userTransactions = transactions.filter(tx => tx.from === username || tx.to === username);
    res.json(userTransactions);
});

// Get asset distribution
router.get('/asset-distribution', (req, res) => {
    const assetDistribution = {};

    transactions.forEach(tx => {
        if (!assetDistribution[tx.assetCode]) {
            assetDistribution[tx.assetCode] = 0;
        }
        assetDistribution[tx.assetCode] += parseFloat(tx.amount);
    });

    res.json(assetDistribution);
});

// Export the router
module.exports = router;
