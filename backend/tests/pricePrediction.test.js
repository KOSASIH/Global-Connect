// backend/tests/pricePrediction.test.js
const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('Price Prediction API', () => {
    it('should get price prediction', async () => {
        const response = await request(app)
            .get('/api/pricePrediction/predict');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('predictedPrice');
    });
});
