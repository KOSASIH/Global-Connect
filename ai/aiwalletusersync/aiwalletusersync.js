const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Ensures user accounts are properly linked and authorized with Pi Network wallets.
 * @param {Object} syncRequest - { userId, walletAddress, syncStatus, sessionInfo }
 * @returns {Promise<{syncResult: string, authStatus: string, issues: string, recommendations: string}>}
 */
async function aiWalletUserSync(syncRequest) {
  const prompt = `
You are AI WalletUserSync. Ensure user accounts and Pi Network wallets are securely synced and authorized.
Report sync result, authorization status, issues, and recommendations.

Request:
${JSON.stringify(syncRequest, null, 2)}

Return as:
syncResult: <string>
authStatus: <string>
issues: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.12,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      syncResult: "Parsing error",
      authStatus: "Parsing error",
      issues: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiWalletUserSync };