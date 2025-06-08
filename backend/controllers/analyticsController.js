// backend/controllers/analyticsController.js
const TransactionService = require('../services/transactionService');

class AnalyticsController {
    // Get total transaction count
    static async getTransactionCount(req, res) {
        try {
            const totalCount = await TransactionService.getTransactionCount();
            res.json({ totalTransactionCount: totalCount });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get total transaction amount
    static async getTotalTransactionAmount(req, res) {
        try {
            const totalAmount = await TransactionService.getTotalTransactionAmount();
            res.json({ totalTransactionAmount: totalAmount });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Get user transaction history
    static async getUserHistory(req, res) {
        const { username } = req.params;
        try {
            const userTransactions = await TransactionService.getTransactionHistory(username);
            res.json(userTransactions);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    // Get asset distribution
    static async getAssetDistribution(req, res) {
        try {
            const assetDistribution = await TransactionService.getAssetDistribution();
            res.json(assetDistribution);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = AnalyticsController;
