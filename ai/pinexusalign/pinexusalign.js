const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Checks if a given banking transaction or process aligns with Pi Nexus Autonomous Banking Network principles.
 * @param {Object} data - Banking, transaction, or system config data to check.
 * @returns {Promise<{aligned: boolean, reason: string}>}
 */
async function checkPiNexusAlignment(data) {
  const prompt = `
You are an AI compliance assistant for the Pi Nexus Autonomous Banking Network.
Key alignment criteria:
- Full autonomy in transaction and account management (minimal manual intervention)
- Modular and API-driven financial operations
- Privacy and security by design
- All transactions auditable and compliant with Pi Nexus standards
Given this data:
${JSON.stringify(data, null, 2)}
Does this fully align with Pi Nexus Autonomous Banking Network rules? Explain concisely.
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

module.exports = { checkPiNexusAlignment };