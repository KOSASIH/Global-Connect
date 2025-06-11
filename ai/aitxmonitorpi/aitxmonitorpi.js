const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors and validates Pi Network transactions for anomalies or compliance issues.
 * @param {Object} txData - { txHash, from, to, amount, timestamp, memo, status }
 * @returns {Promise<{txValid: boolean, riskLevel: string, anomalies: string, actionRequired: string}>}
 */
async function aiTxMonitorPi(txData) {
  const prompt = `
You are AI TxMonitorPi. Analyze and validate this Pi Network transaction to detect anomalies, fraud, or compliance violations.
State whether the transaction is valid, risk level, anomalies, and action required.

Transaction:
${JSON.stringify(txData, null, 2)}

Return as:
txValid: true/false
riskLevel: <string>
anomalies: <string>
actionRequired: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.13,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      txValid: false,
      riskLevel: "Parsing error",
      anomalies: "Parsing error",
      actionRequired: "Manual review required"
    };
  }
}

module.exports = { aiTxMonitorPi };