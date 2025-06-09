// tests/integration/apiIntegration.test.js
const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your app
const db = require('../../src/db'); // Adjust the path to your database connection

describe('API Integration Tests', () => {
    beforeAll(async () => {
        // Connect to the database before running tests
        await db.connect();
    });

    afterAll(async () => {
        // Disconnect from the database after tests
        await db.disconnect();
    });

    it('should create a new user account and return a success message', async () => {
        const response = await request(app)
            .post('/api/create-account')
            .send({
                email: 'integrationtestuser@example.com',
                password: 'SecurePassword123',
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Account created successfully!');
    });

    it('should log in the user and return a token', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'integrationtestuser@example.com',
                password: 'SecurePassword123',
            });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
    });

    it('should issue PiCoins to the user', async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                email: 'integrationtestuser@example.com',
                password: 'SecurePassword123',
            });
        const userToken = loginResponse.body.token;

        const response = await request(app)
            .post('/api/issue-picoins')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ amount: 100 });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('100 PI issued successfully!');
    });

    it('should retrieve the user balance', async () => {
        const loginResponse = await request(app)
            .post('/api/login')
            .send({
                email: 'integrationtestuser@example.com',
                password: 'SecurePassword123',
            });
        const userToken = loginResponse.body.token;

        const response = await request(app)
            .get('/api/get-balance')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('balance');
    });
});
