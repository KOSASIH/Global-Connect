// backend/controllers/pricePredictionController.js
const PricePredictionService = require('../services/pricePredictionService');

class PricePredictionController {
    // Get price prediction
    static async getPredictedPrice(req, res) {
        try {
            const predictedPrice = await PricePredictionService.getPredictedPrice();
            res.json(predictedPrice);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = PricePredictionController;
