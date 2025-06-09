// tests/e2e/userFlow.test.js
const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your app

describe('User  Flow Tests', () => {
    let userToken;

    it('should create a new user account', async () => {
        const response = await request(app)
            .post('/api/create-account')
            .send({
                email: 'testuser@example.com',
                password: 'SecurePassword123',
            });
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Account created successfully!');
    });

    it('should log in the user', async () => {
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'testuser@example.com',
                password: 'SecurePassword123',
            });
        expect(response.status).toBe(200);
        expect(response.body.token).toBeDefined();
        userToken = response.body.token; // Store the token for later use
    });

    it('should access the dashboard', async () => {
        const response = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('balance');
    });
});
