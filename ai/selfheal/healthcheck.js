const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Evaluate system metrics and predict if a failure or performance drop is likely soon.
 * @param {object} metrics - { cpu, memory, latency, errors, uptime, ... }
 * @returns {Promise<{status:string, riskFactors:string[]}>}
 */
async function predictHealth(metrics) {
  const prompt = `
Given the following system metrics for Global-Connect, predict if a failure or major slowdown is likely in the next hour.
Metrics: ${JSON.stringify(metrics, null, 2)}
List any risk factors.
Respond as:
status: <healthy|warning|critical>
riskFactors: [ ... ]
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.1
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  const txt = response.data.choices[0].message.content;
  const matchStatus = txt.match(/status:\s*([a-zA-Z]+)/i);
  const matchFactors = txt.match(/riskFactors:\s*(\[[\s\S]*\])/i);
  return {
    status: matchStatus ? matchStatus[1].trim() : "unknown",
    riskFactors: matchFactors ? JSON.parse(matchFactors[1]) : []
  };
}

module.exports = { predictHealth };