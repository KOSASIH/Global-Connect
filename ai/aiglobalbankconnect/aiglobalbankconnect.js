const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors the health, status, and security of global bank integrations.
 * @param {Object} integrationStatus - { bankName, country, apiStatus, lastPing, errorLog, securityLevel }
 * @returns {Promise<{connectionHealthy: boolean, issues: string, securityAssessment: string, recommendations: string}>}
 */
async function aiGlobalBankConnect(integrationStatus) {
  const prompt = `
You are AI GlobalBankConnect. Evaluate the following data for a connection to a global bank or financial system.
Determine if the connection is healthy and secure, list any issues, give a security assessment, and suggest recommendations.

Integration Status:
${JSON.stringify(integrationStatus, null, 2)}

Return as:
connectionHealthy: true/false
issues: <string>
securityAssessment: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.10,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      connectionHealthy: false,
      issues: "Parsing error",
      securityAssessment: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiGlobalBankConnect };