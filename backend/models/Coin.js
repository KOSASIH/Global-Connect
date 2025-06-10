// backend/models/Coin.js

const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
    badge: { type: String, required: true },
    value: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coin', coinSchema);
