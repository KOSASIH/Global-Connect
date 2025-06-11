const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Validates and monitors Wallet Connect sessions for security.
 * @param {Object} connectAttempt - { walletAddress, dappDomain, sessionData, userAgent, timestamp }
 * @returns {Promise<{isSafe: boolean, detectedRisk: string, suggestedAction: string}>}
 */
async function aiWalletConnectGuard(connectAttempt) {
  const prompt = `
You are AI WalletConnectGuard. Analyze this wallet connection attempt for security risks, phishing, or abuse.
State if the connection is safe, detected risks, and precautionary actions.

Attempt:
${JSON.stringify(connectAttempt, null, 2)}

Return as:
isSafe: true/false
detectedRisk: <string>
suggestedAction: <string>
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
      isSafe: false,
      detectedRisk: "Parsing error",
      suggestedAction: "Manual review required"
    };
  }
}

module.exports = { aiWalletConnectGuard };