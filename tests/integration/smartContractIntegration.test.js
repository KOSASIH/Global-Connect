// tests/integration/smartContractIntegration.test.js
const StellarSdk = require('stellar-sdk');
const request = require('supertest');
const app = require('../../src/app'); // Adjust the path to your app

describe('Smart Contract Integration Tests', () => {
    let userToken;
    const secretKey = 'YOUR_SECRET_KEY'; // Replace with a valid secret key
    const keypair = StellarSdk.Keypair.fromSecret(secretKey);
    const accountId = keypair.publicKey();

    beforeAll(async () => {
        // Create a user and log in to get the token
        await request(app)
            .post('/api/create-account')
            .send({
                email: 'smartcontracttestuser@example.com',
                password: 'SecurePassword123',
            });
        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'smartcontracttestuser@example.com',
                password: 'SecurePassword123',
            });
        userToken = response.body.token;
    });

    it('should create a new asset on the Stellar network', async () => {
        const response = await request(app)
            .post('/api/create-asset')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                secretKey: secretKey,
            });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Asset PI created successfully!');
    });

    it('should issue PiCoins using the smart contract', async () => {
        const response = await request(app)
            .post('/api/issue-picoins')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ amount: 100 });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('100 PI issued successfully!');
    });

    it('should transfer PiCoins using the smart contract', async () => {
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
