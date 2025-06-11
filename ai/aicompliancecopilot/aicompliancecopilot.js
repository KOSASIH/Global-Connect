const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Proactive, explainable compliance analysis for any transaction/user event.
 * @param {Object} event - { type, data }
 * @returns {Promise<{approved: boolean, reason: string, lawReferences: string[], remediation: string}>}
 */
async function aiComplianceCopilot(event) {
  const prompt = `
You are ComplianceCopilot AI. Review this event for global KYC/AML/PEP/OFAC compliance.
Return if it's approved, the reason, relevant law references, and remediation if needed.

Event:
${JSON.stringify(event, null, 2)}

Return as:
{
  "approved": true/false,
  "reason": "...",
  "lawReferences": ["..."],
  "remediation": "..."
}
  `;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    return JSON.parse(content.match(/\{[\s\S]*\}/)[0]);
  } catch (e) {
    return { approved: false, reason: "Error: " + e.message, lawReferences: [], remediation: "Manual review" };
  }
}

module.exports = { aiComplianceCopilot };