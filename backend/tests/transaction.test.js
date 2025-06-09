// backend/tests/transaction.test.js
const request = require('supertest');
const app = require('../server'); // Import your Express app
const User = require('../models/User');
const Transaction = require('../models/Transaction');

describe('Transaction API', () => {
    let token;

    beforeAll(async () => {
        await User.deleteMany({});
        await Transaction.deleteMany({});
        
        // Create a test user
        const user = new User({ username: 'testuser', password: 'password123' });
        await user.save();

        // Login to get token
        const loginResponse = await request(app)
            .post('/api/user/login')
            .send({ username: 'testuser', password: 'password123' });
        
        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Transaction.deleteMany({});
    });

    it('should create a new transaction', async () => {
        const response = await request(app)
            .post('/api/transaction/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ destination: 'destinationAddress', amount: 100, assetCode: 'Pi' });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
    });

    it('should get transaction history', async () => {
        const response = await request(app)
            .get('/api/transaction/history/testuser')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});
