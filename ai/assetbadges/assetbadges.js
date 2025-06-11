const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Determine if an asset/transaction is eligible for a Purified (🌟) Badge.
 * @param {object} asset - e.g. { type: "Pi Coin", amount: 2, compliance: true, source: "certified" }
 * @returns {Promise<{purified: boolean, reason: string}>}
 */
async function assignPurifyBadge(asset) {
  const prompt = `
  Assess the following asset or transaction for compliance and stability. 
  If it meets high standards, assign a "Purified" (🌟) badge. 
  Respond with purified: true/false and a brief reason.
  Asset: ${JSON.stringify(asset, null, 2)}
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
  // Example response: purified: true, reason: "Compliant source, stable value."
  return parsePurifyResponse(response.data.choices[0].message.content);
}

// Helper: Parse GPT-4 response for badge info
function parsePurifyResponse(text) {
  const match = text.match(/purified\s*[:=]\s*(true|false)[,;]?\s*reason\s*[:=]\s*(.*)/i);
  if (match) {
    return { purified: match[1].toLowerCase() === "true", reason: match[2].trim() };
  }
  // fallback: try to extract
  return { purified: text.toLowerCase().includes("true"), reason: text };
}

module.exports = { assignPurifyBadge };