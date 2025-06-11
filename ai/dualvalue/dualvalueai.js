const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Ask AI to review a Pi Coin transaction or holding for dual value compliance.
 * @param {Object} txInfo
 * @returns {Promise<{compliant: boolean, reason: string}>}
 */
async function aiReviewDualValue(txInfo) {
  const prompt = `
Review the following Pi Coin transaction or holding for compliance with a dual value system:
- Internal Pi: Only mined, peer-to-peer, or contribution, never on external exchanges, always $314,159 value.
- External Pi: Any Pi that has ever touched an external exchange, market value only.
Transaction/Holding:
${JSON.stringify(txInfo, null, 2)}
Is this compliant? Explain.
Format:
compliant: true/false
reason: <short explanation>
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
  const txt = response.data.choices[0].message.content;
  const matchCompliant = txt.match(/compliant\s*:\s*(true|false)/i);
  const matchReason = txt.match(/reason\s*:\s*(.*)/i);
  return {
    compliant: matchCompliant ? matchCompliant[1].toLowerCase() === "true" : false,
    reason: matchReason ? matchReason[1].trim() : txt
  };
}

module.exports = { aiReviewDualValue };