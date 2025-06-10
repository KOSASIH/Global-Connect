// backend/models/Transaction.js

const mongoose = require('mongoose');

// Define the transaction schema
const transactionSchema = new mongoose.Schema({
    from: { 
        type: String, 
        required: true 
    },
    to: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    assetCode: { 
        type: String, 
        required: true 
    },
    coins: [{
        badge: { 
            type: String, 
            required: true 
        },
        value: { 
            type: Number, 
            required: true 
        }
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Create indexes for efficient querying
transactionSchema.index({ createdAt: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });

// Export the Transaction model
module.exports = mongoose.model('Transaction', transactionSchema);
