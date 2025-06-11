const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analyze logs and metrics for anomalies and propose solutions.
 * @param {string[]} logs - Array of recent log lines.
 * @param {object} metrics - { cpu, memory, latency, errors, ... }
 * @returns {Promise<{diagnosis: string, actions: string[]}>}
 */
async function diagnoseSystem(logs, metrics) {
  const prompt = `
You are an AI system administrator for a production Node.js app called "Global-Connect".
Recent logs:
${logs.slice(-20).join('\n')}
Current metrics: ${JSON.stringify(metrics, null, 2)}

1. Diagnose the main problems.
2. Suggest up to 3 immediate healing actions (e.g., restart service, clear cache, scale up, roll back).
3. Mark any critical failures for urgent attention.
Respond as:
diagnosis: <diagnosis>
actions: [<action1>, <action2>, ...]
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.2
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  // Try to parse result for structured data
  const txt = response.data.choices[0].message.content;
  const matchDiagnosis = txt.match(/diagnosis:([\s\S]*?)actions:/i);
  const matchActions = txt.match(/actions:\s*(\[[\s\S]*\])/i);
  return {
    diagnosis: matchDiagnosis ? matchDiagnosis[1].trim() : txt,
    actions: matchActions ? JSON.parse(matchActions[1]) : []
  };
}

/**
 * Apply a healing action (simulate; in production, wire up to orchestration scripts/APIs)
 * @param {string} action
 * @returns {Promise<string>}
 */
async function applyHealingAction(action) {
  // Simulate: In real-world, use SSH, k8s, systemctl, etc.
  return `Simulated execution of action: "${action}". (Integrate with your orchestration layer for real effect.)`;
}

module.exports = { diagnoseSystem, applyHealingAction };