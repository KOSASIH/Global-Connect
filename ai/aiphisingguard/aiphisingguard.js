const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Detects phishing or social engineering attempts in user messages or inputs.
 * @param {Object} messageData - { userId, messageContent, context }
 * @returns {Promise<{phishingDetected: boolean, warningLevel: string, evidence: string, suggestedResponse: string}>}
 */
async function aiPhishingGuard(messageData) {
  const prompt = `
You are an AI PhishingGuard. Examine the following message or input for signs of phishing or social engineering. Clearly state if phishing is detected, the warning level, evidence, and a suggested response.

Message Data:
${JSON.stringify(messageData, null, 2)}

Return as:
phishingDetected: true/false
warningLevel: <string>
evidence: <string>
suggestedResponse: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4',
      messages: [{ role: "user", content: prompt }],
      temperature: 0.13,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      phishingDetected: true,
      warningLevel: "High",
      evidence: "Parsing error",
      suggestedResponse: "Block and report to security team"
    };
  }
}

module.exports = { aiPhishingGuard };