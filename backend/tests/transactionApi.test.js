const request = require('supertest');
const express = require('express');
const transactionRouter = require('../api/transaction');

const app = express();
app.use(express.json());
// Mock authentication middleware
app.use((req, res, next) => { req.user = { username: 'tester', isAdmin: true }; next(); });
app.use('/api/transaction', transactionRouter);

// Mocks for TransactionService & NotificationService
jest.mock('../services/transactionService', () => ({
  createTransaction: jest.fn(async (from, to, amount, assetCode, valueType) =>
    ({ id: 'tx123', from, to, amount, assetCode, valueType })),
  getTransactionHistory: jest.fn(async (username) => [
    { id: 'tx1', from: username, to: 'dest', amount: 1, assetCode: 'PI', valueType: 'internal' }
  ])
}));
jest.mock('../services/notificationService', () => ({
  notifyTransactionSuccess: jest.fn().mockResolvedValue(),
  notifyTransactionFailure: jest.fn().mockResolvedValue()
}));
jest.mock('../audit/auditLogger', () => ({
  logAudit: jest.fn()
}));

describe('Transaction API', () => {
  it('should reject missing destination', async () => {
    const res = await request(app)
      .post('/api/transaction/create')
      .send({ amount: 10, assetCode: 'PI', valueType: 'internal' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should create a transaction with correct fields', async () => {
    const res = await request(app)
      .post('/api/transaction/create')
      .send({
        destination: 'receiver',
        amount: 15,
        assetCode: 'PI',
        valueType: 'external'
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('tx123');
    expect(res.body.to).toBe('receiver');
    expect(res.body.amount).toBe(15);
    expect(res.body.valueType).toBe('external');
  });

  it('should return transaction history', async () => {
    const res = await request(app).get('/api/transaction/history/tester');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body[0].from).toBe('tester');
  });
});
