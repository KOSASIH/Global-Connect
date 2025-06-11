const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors all KYC operations for delays, anomalies, or compliance risks.
 * @param {Object} kycOps - { totalRequests, failedChecks, pendingVerifications, flaggedUsers, systemAlerts }
 * @returns {Promise<{opsHealthy: boolean, anomalies: string, flagged: string, recommendations: string}>}
 */
async function aiKYCMonitor(kycOps) {
  const prompt = `
You are AI KYCMonitor. Monitor the following KYC operations for system health, delays, anomalies, and compliance exposures.
Clearly state if operations are healthy, anomalies detected, flagged items, and recommendations.

KYC Ops:
${JSON.stringify(kycOps, null, 2)}

Return as:
opsHealthy: true/false
anomalies: <string>
flagged: <string>
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
      opsHealthy: false,
      anomalies: "Parsing error",
      flagged: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiKYCMonitor };