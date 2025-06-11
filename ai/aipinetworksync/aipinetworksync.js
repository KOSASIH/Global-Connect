const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Ensures the system is properly synced and integrated with the Pi Network (mainnet/testnet).
 * @param {Object} syncSpec - { nodeStatus, walletStatus, connectionType, lastBlock }
 * @returns {Promise<{syncStatus: string, issues: string, recommendations: string}>}
 */
async function aiPiNetworkSync(syncSpec) {
  const prompt = `
You are AI PiNetworkSync. Evaluate the sync status between this system and the Pi Network (mainnet/testnet) and Wallet Connect.
Report the sync status, detected issues, and recommended actions.

Specification:
${JSON.stringify(syncSpec, null, 2)}

Return as:
syncStatus: <string>
issues: <string>
recommendations: <string>
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
      syncStatus: "Parsing error",
      issues: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiPiNetworkSync };