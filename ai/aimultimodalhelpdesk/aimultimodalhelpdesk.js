const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Answers user questions using all available context, with emotion and intent detection.
 * @param {string} input - User's chat/message/voice input
 * @param {Object} context - { userId, txData, complianceStatus, history }
 * @returns {Promise<{answer: string, detectedEmotion: string, detectedIntent: string, escalationRequired: boolean}>}
 */
async function aiMultimodalHelpdesk(input, context) {
  const prompt = `
You are an AI helpdesk agent. Given user input and context, answer clearly, detect emotion and intent, and decide if escalation is needed.

User input: ${input}
Context: ${JSON.stringify(context, null, 2)}

Return as JSON:
{
  "answer": "",
  "detectedEmotion": "",
  "detectedIntent": "",
  "escalationRequired": true/false
}
  `.trim();
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.12,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const match = response.data.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("No valid JSON returned from AI.");
  } catch (e) {
    return {
      answer: "Sorry, an error occurred.",
      detectedEmotion: "unknown",
      detectedIntent: "unknown",
      escalationRequired: true
    };
  }
}

module.exports = { aiMultimodalHelpdesk };