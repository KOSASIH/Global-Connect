// backend/tests/analytics.test.js
const request = require('supertest');
const app = require('../server'); // Import your Express app
const Transaction = require('../models/Transaction');

describe('Analytics API', () => {
    beforeAll(async () => {
        await Transaction.deleteMany({});
        // Add some test transactions if needed
    });

    afterAll(async () => {
        await Transaction.deleteMany({});
    });

    it('should get total transaction count', async () => {
        const response = await request(app)
            .get('/api/analytics/transaction-count');
        
        expect(response.status).toBe(200);
        expect(response.body.totalTransactionCount).toBeDefined();
    });

    it('should get total transaction amount', async () => {
        const response = await request(app)
            .get('/api/analytics/total-transaction-amount');
        
        expect(response.status).toBe(200);
        expect(response.body.totalTransactionAmount).toBeDefined();
    });
});
