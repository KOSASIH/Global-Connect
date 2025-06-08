// backend/api/pricePrediction.js
const express = require('express');
const PricePredictionService = require('../services/pricePredictionService');
const router = express.Router();

// Get price prediction
router.get('/predict', async (req, res) => {
    try {
        const predictedPrice = await PricePredictionService.getPredictedPrice();
        res.json(predictedPrice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
