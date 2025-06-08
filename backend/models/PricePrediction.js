// backend/models/PricePrediction.js
const mongoose = require('mongoose');

const pricePredictionSchema = new mongoose.Schema({
    predictedPrice: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const PricePrediction = mongoose.model('PricePrediction', pricePredictionSchema);
module.exports = PricePrediction;
