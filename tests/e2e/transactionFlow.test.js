// tests/e2e/transactionFlow.test.js
const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your app

describe('Transaction Flow Tests', () => {
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

    it('should issue PiCoins to the user', async () => {
        const response = await request(app)
            .post('/api/issue-picoins')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ amount: 100 });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('100 PI issued successfully!');
    });

    it('should transfer PiCoins to another user', async () => {
        const response = await request(app)
            .post('/api/transfer-picoins')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                destination: 'DESTINATION_ACCOUNT_PUBLIC_KEY', // Replace with a valid public key
                amount: 10,
            });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('10 PI transferred to DESTINATION_ACCOUNT_PUBLIC_KEY!');
    });
});
