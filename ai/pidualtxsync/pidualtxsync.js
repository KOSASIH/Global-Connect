const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Checks if a given transaction/process/record aligns with PiDualTx principles.
 * @param {Object} txData - Transaction or system data to check.
 * @returns {Promise<{aligned: boolean, reason: string}>}
 */
async function checkPiDualTxAlignment(txData) {
  const prompt = `
You are an AI compliance assistant for the PiDualTx protocol.
PiDualTx is a dual value, dual ledger system for Pi Coin, enforcing:
- Complete separation of internal (Purified Pi) and external (Market Pi) flows
- Strict rules for conversion, KYC, and provenance
- All internal transactions must be fully auditable and never mixed with external Pi

Given this data:
${JSON.stringify(txData, null, 2)}

Does this fully align with PiDualTx rules? Explain concisely.
Format:
aligned: true/false
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
  const matchAligned = txt.match(/aligned\s*:\s*(true|false)/i);
  const matchReason = txt.match(/reason\s*:\s*(.*)/i);
  return {
    aligned: matchAligned ? matchAligned[1].toLowerCase() === "true" : false,
    reason: matchReason ? matchReason[1].trim() : txt
  };
}

module.exports = { checkPiDualTxAlignment };