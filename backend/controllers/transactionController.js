// backend/controllers/transactionController.js
const TransactionService = require('../services/transactionService');
const NotificationService = require('../services/notificationService');

class TransactionController {
    // Create a new transaction
    static async createTransaction(req, res) {
        const { destination, amount, assetCode } = req.body;
        try {
            const newTransaction = await TransactionService.createTransaction(destination, amount, assetCode);
            await NotificationService.notifyTransactionSuccess(req.user.username, newTransaction.id);
            res.status(201).json(newTransaction);
        } catch (error) {
            await NotificationService.notifyTransactionFailure(req.user.username, null);
            res.status(500).json({ message: error.message });
        }
    }

    // Get transaction history
    static async getTransactionHistory(req, res) {
        const { username } = req.params;
        try {
            const transactions = await TransactionService.getTransactionHistory(username);
            res.json(transactions);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = TransactionController;
