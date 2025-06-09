// backend/tests/authenticity.test.js
const request = require('supertest');
const app = require('../server'); // Import your Express app

describe('Authenticity API', () => {
    it('should validate Pi authenticity', async () => {
        const response = await request(app)
            .post('/api/authenticity/validate')
            .send({ transactionId: 'tx_test_id' }); // Use a valid transaction ID for testing
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('isValid');
    });
});
