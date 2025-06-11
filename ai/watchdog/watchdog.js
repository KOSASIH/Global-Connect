const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Real-time system anomaly detection and self-healing suggestion.
 * @param {Object} systemStatus - System health, logs, and metrics.
 * @returns {Promise<{alert: boolean, issues: Array, actions: Array}>}
 */
async function aiWatchdog(systemStatus) {
  const prompt = `
You are the AI Watchdog for a hyper-advanced, unstoppable system.
Analyze the following status and logs for signs of failure, attack, resource exhaustion, or abnormal behavior.
Suggest instant, autonomous self-healing actions.
Status:
${JSON.stringify(systemStatus, null, 2)}
Return format:
alert: true/false
issues: [list]
actions: [list]
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    // fallback in case AI returns in a slightly wrong format
    return { alert: true, issues: ["AI parsing error"], actions: ["Manual review required"] };
  }
}

module.exports = { aiWatchdog };