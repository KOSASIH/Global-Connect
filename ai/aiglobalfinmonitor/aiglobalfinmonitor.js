const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors transaction and operational flows between your system and multiple banks.
 * @param {Object} opsData - { bankNetwork, transactionsToday, failedTx, latencyMs, reconciliationStatus, alerts }
 * @returns {Promise<{operationsNormal: boolean, bottlenecks: string, failureAnalysis: string, recommendations: string}>}
 */
async function aiGlobalFinMonitor(opsData) {
  const prompt = `
You are AI GlobalFinMonitor. Analyze transactional and operational data between a system and multiple banks.
Report if everything is normal, note bottlenecks or failures, and provide actionable recommendations.

Ops Data:
${JSON.stringify(opsData, null, 2)}

Return as:
operationsNormal: true/false
bottlenecks: <string>
failureAnalysis: <string>
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
      operationsNormal: false,
      bottlenecks: "Parsing error",
      failureAnalysis: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiGlobalFinMonitor };