const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors AML operations, detects suspicious activity, and generates compliance alerts.
 * @param {Object} amlOps - { txVolume, suspiciousTx, flaggedAccounts, reportCount, regulatoryAlerts }
 * @returns {Promise<{amlHealthy: boolean, suspicious: string, flagged: string, recommendations: string}>}
 */
async function aiAMLMonitor(amlOps) {
  const prompt = `
You are AI AMLMonitor. Monitor the following AML operations data for suspicious activity, flagged accounts, and regulatory alerts.
Report if AML ops are healthy, suspicious findings, flagged items, and recommendations.

AML Ops:
${JSON.stringify(amlOps, null, 2)}

Return as:
amlHealthy: true/false
suspicious: <string>
flagged: <string>
recommendations: <string>
  `;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.11,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    return JSON.parse(response.data.choices[0].message.content);
  } catch (e) {
    return {
      amlHealthy: false,
      suspicious: "Error or parsing failure during AI analysis.",
      flagged: "Error or parsing failure during AI analysis.",
      recommendations: "Manual review required. Error: " + e.message
    };
  }
}

module.exports = { aiAMLMonitor };