// tests/e2e/authenticityFlow.test.js
const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your app

describe('Authenticity Flow Tests', () => {
    let userToken;

    beforeAll(async () => {
        // Create a user and log in to get the token
        await request(app)
            .post('/api/create-account')
            .send({
                email: 'testuser@example.com',
                password: 'SecurePassword123',
            });
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'testuser@example.com',
                password: 'SecurePassword123',
            });
        userToken = response.body.token;
    });

    it('should deny access to protected routes without a token', async () => {
        const response = await request(app)
            .get('/api/dashboard');
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    it('should allow access to protected routes with a valid token', async () => {
        const response = await request(app)
            .get('/api/dashboard')
            .set('Authorization', `Bearer ${userToken}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('balance');
    });
});
