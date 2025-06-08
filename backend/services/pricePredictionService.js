// backend/services/pricePredictionService.js
const historicalPrices = [
    { date: '2023-01-01', price: 100 },
    { date: '2023-02-01', price: 110 },
    { date: '2023-03-01', price: 105 },
    { date: '2023-04-01', price: 120 },
    { date: '2023-05-01', price: 115 },
];

class PricePredictionService {
    // Simple price prediction algorithm (mock)
    static predictPrice() {
        const latestPrice = historicalPrices[historicalPrices.length - 1].price;
        const predictedPrice = latestPrice * 1.05; // Predicting a 5% increase
        return predictedPrice;
    }

    // Get predicted price
    static async getPredictedPrice() {
        const predictedPrice = this.predictPrice();
        return { predictedPrice };
    }
}

module.exports = PricePredictionService;
