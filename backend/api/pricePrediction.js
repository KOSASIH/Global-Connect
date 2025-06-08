// backend/api/pricePrediction.js
const express = require('express');
const router = express.Router();

// Mock historical price data (for demonstration purposes)
const historicalPrices = [
    { date: '2023-01-01', price: 100 },
    { date: '2023-02-01', price: 110 },
    { date: '2023-03-01', price: 105 },
    { date: '2023-04-01', price: 120 },
    { date: '2023-05-01', price: 115 },
];

// Simple price prediction algorithm (linear regression mock)
function predictPrice() {
    const latestPrice = historicalPrices[historicalPrices.length - 1].price;
    const predictedPrice = latestPrice * 1.05; // Predicting a 5% increase
    return predictedPrice;
}

// Get price prediction
router.get('/predict', (req, res) => {
    const predictedPrice = predictPrice();
    res.json({ predictedPrice });
});

// Export the router
module.exports = router;
