const { predictPriceAI } = require('../ai/pricePredictionAI');
const { analyzeRisk } = require('../ai/riskAnalysisAI');

async function predictPrice() {
    const predictedPrice = await predictPriceAI();
    return predictedPrice;
}

async function assessRisk(userId) {
    const riskProfile = await analyzeRisk(userId);
    return riskProfile;
}

module.exports = {
    predictPrice,
    assessRisk,
};
