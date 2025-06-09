// backend/tests/user.test.js
const request = require('supertest');
const app = require('../server'); // Import your Express app
const User = require('../models/User');

describe('User API', () => {
    beforeAll(async () => {
        await User.deleteMany({}); // Clear the database before tests
    });

    afterAll(async () => {
        await User.deleteMany({}); // Clean up after tests
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/user/register')
            .send({ username: 'testuser', password: 'password123' });
        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('user');
    });

    it('should login an existing user', async () => {
        const response = await request(app)
            .post('/api/user/login')
            .send({ username: 'testuser', password: 'password123' });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('should get user profile', async () => {
        const loginResponse = await request(app)
            .post('/api/user/login')
            .send({ username: 'testuser', password: 'password123' });
        
        const token = loginResponse.body.token;

        const response = await request(app)
            .get('/api/user/profile/testuser')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('testuser');
    });

    it('should update user profile', async () => {
        const loginResponse = await request(app)
            .post('/api/user/login')
            .send({ username: 'testuser', password: 'password123' });
        
        const token = loginResponse.body.token;

        const response = await request(app)
            .put('/api/user/profile/testuser')
            .set('Authorization', `Bearer ${token}`)
            .send({ password: 'newpassword123' });
        
        expect(response.status).toBe(200);
        expect(response.body.username).toBe('testuser');
    });

    it('should delete user account', async () => {
        const loginResponse = await request(app)
            .post('/api/user/login')
            .send({ username: 'testuser', password: 'newpassword123' });
        
        const token = loginResponse.body.token;

        const response = await request(app)
            .delete('/api/user/profile/testuser')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted successfully');
    });
});
