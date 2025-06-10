// backend/config/config.js

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key', // Replace with a strong, randomly generated secret
    paymentGatewayApiKey: process.env.PAYMENT_GATEWAY_API_KEY || 'your-payment-gateway-api-key', // Replace with your API key
    exchangeRateApiUrl: process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate.host', // Replace with the actual API URL
    // Add other configuration settings here
};
