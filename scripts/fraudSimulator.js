// Simulate a fraudulent transaction and test AI detectors
const axios = require('axios');

async function simulateFraud() {
  const fakeTx = {
    transactionId: 'fraud-' + Date.now(),
    amount: 999999,
    currency: 'USD',
    userId: 'attacker',
    timestamp: new Date().toISOString(),
    description: 'Suspicious transfer to offshore account'
  };
  try {
    await axios.post('http://localhost:4000/api/transaction', fakeTx);
    console.log('Fraudulent transaction simulated.');
  } catch (err) {
    console.error('Simulation failed:', err.response?.data || err.message);
  }
}

simulateFraud();
