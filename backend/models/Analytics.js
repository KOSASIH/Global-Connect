// backend/models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    totalTransactionCount: {
        type: Number,
        default: 0,
    },
    totalTransactionAmount: {
        type: Number,
        default: 0,
    },
    assetDistribution: {
        type: Map,
        of: Number, // Key-value pairs for asset codes and their amounts
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;
