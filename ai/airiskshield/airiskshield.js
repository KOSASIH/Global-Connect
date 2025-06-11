const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Predict and describe future risks or exploits based on patterns in code, contracts, and transaction data.
 * @param {Object} scan - { codeSnippets, contractABIs, txPatterns }
 * @returns {Promise<{riskLevel: string, threats: Array, recommendations: Array}>}
 */
async function aiRiskShield(scan) {
  const prompt = `
You are the ultimate AI Risk Shield for a crypto super-app.
Scan the following for any sign of exploits, rug pulls, backdoors, or attack vectors:
${JSON.stringify(scan, null, 2)}
Give a risk level (Low/Medium/High/Critical), enumerate the threats, and give mitigation recommendations.
Return format:
riskLevel: <string>
threats: [list]
recommendations: [list]
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
    return { riskLevel: "Unknown", threats: ["AI parsing error"], recommendations: ["Manual security audit required"] };
  }
}

module.exports = { aiRiskShield };