const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Plan for the most extreme system failures: black swan, global outages, censorship, etc.
 * @param {Object} scenario - { threatType, affectedModules, impact }
 * @returns {Promise<{recoveryPlan: Array, resilienceScore: number}>}
 */
async function aiFailSafe(scenario) {
  const prompt = `
You are the AI Fail-Safe for an unstoppable platform.
Given this extreme scenario:
${JSON.stringify(scenario, null, 2)}
Devise a step-by-step recovery plan and rate the system's resilience from 1 (fragile) to 10 (invincible).
Return format:
recoveryPlan: [list]
resilienceScore: <number>
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
    return { recoveryPlan: ["AI parsing error"], resilienceScore: 0 };
  }
}

module.exports = { aiFailSafe };