// backend/services/transactionService.js

const Transaction = require('../models/Transaction'); // Transaction model
const StellarSdk = require('stellar-sdk');
const { BadRequestError } = require('../errors'); // Custom error class for handling bad requests
const BadgeService = require('./badgeService'); // Import badge service for purity validation

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY); // Replace with your secret key
const accountId = keypair.publicKey();

class TransactionService {
    // Create a new transaction
    static async createTransaction(destination, amount, assetCode, user) {
        // Validate the user's Pi Coin purity
        const isPure = await BadgeService.isPurePiCoin(user);
        if (!isPure) {
            throw new BadRequestError('Transaction failed: Only pure Pi Coins can be used for transactions.');
        }

        const account = await server.loadAccount(accountId);
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: destination,
            asset: new StellarSdk.Asset(assetCode, accountId),
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(keypair);
        const result = await server.submitTransaction(transaction);

        // Save transaction details to the database
        const newTransaction = new Transaction({
            id: result.hash,
            from: accountId,
            to: destination,
            amount,
            assetCode,
            timestamp: new Date().toISOString(),
        });
        await newTransaction.save();

        return newTransaction;
    }

    // Get transaction history for a user
    static async getTransactionHistory(username) {
        const transactions = await Transaction.find({ $or: [{ from: username }, { to: username }] });
        return transactions;
    }
}

module.exports = TransactionService;
