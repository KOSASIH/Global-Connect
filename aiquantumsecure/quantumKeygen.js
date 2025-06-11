const { randomBytes } = require('crypto');

/**
 * Generates a quantum-resistant key (simulated; for demo, use a quantum-safe lib in production)
 */
function generateQuantumKey(length = 64) {
  // Use a quantum-safe library like PQCrypto for real-world use
  return randomBytes(length).toString('hex');
}

module.exports = { generateQuantumKey };
