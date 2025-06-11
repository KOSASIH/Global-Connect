const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Routes payments for optimal speed, cost, and compliance using AI.
 * @param {Object} tx - { from, to, amount, currency, options: { speed, cost, compliance }, rails: [bank, chain, ...] }
 * @returns {Promise<{bestRoute: string, reason: string, liveMapUrl: string}>}
 */
async function aiLiquidityRouter(tx) {
  const prompt = `
You are an AI liquidity router. Given a payment transaction and available rails (banks, chains, stablecoins), select the best route for optimal speed, cost, and compliance.
Return your choice, reasoning, and a (hypothetical) live map URL.

Transaction:
${JSON.stringify(tx, null, 2)}

Return as JSON:
{
  "bestRoute": "",
  "reason": "",
  "liveMapUrl": ""
}
  `.trim();
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.10,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const match = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("No valid JSON returned from AI.");
  } catch (e) {
    return {
      bestRoute: "manual_selection",
      reason: "AI or API error: " + (e.message || "Unknown error"),
      liveMapUrl: ""
    };
  }
}

module.exports = { aiLiquidityRouter };