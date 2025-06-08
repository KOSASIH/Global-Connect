// backend/api/transaction.js
const express = require('express');
const StellarSdk = require('stellar-sdk');
const router = express.Router();

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();

// In-memory transaction storage (for demonstration purposes)
const transactions = [];

// Middleware to authenticate JWT (import from user.js)
const { authenticateToken } = require('./user');

// Create a new transaction
router.post('/create', authenticateToken, async (req, res) => {
    const { destination, amount, assetCode } = req.body;

    try {
        const account = await server.loadAccount(accountId);
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: destination,
            asset: new StellarSdk.Asset(assetCode, accountId), // Assuming the asset is issued by the account
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(keypair);
        const result = await server.submitTransaction(transaction);

        // Store transaction details in memory
        transactions.push({
            id: result.hash,
            from: accountId,
            to: destination,
            amount,
            assetCode,
            timestamp: new Date().toISOString(),
        });

        res.status(201).json({ message: 'Transaction created successfully', transactionId: result.hash });
    } catch (error) {
        console.error('Transaction creation failed:', error);
        res.status(500).json({ message: 'Transaction creation failed', error: error.message });
    }
});

// Get transaction history
router.get('/history', authenticateToken, (req, res) => {
    const userTransactions = transactions.filter(tx => tx.from === accountId || tx.to === accountId);
    res.json(userTransactions);
});

// Export the router
module.exports = router;
