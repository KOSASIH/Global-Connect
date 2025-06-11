const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Checks and orchestrates integration readiness between the system and various banks/payment rails.
 * @param {Object} bankReq - { bankName, country, integrationStatus, requiredAPIs, complianceDocs }
 * @returns {Promise<{isReady: boolean, missingElements: string, complianceStatus: string, recommendations: string}>}
 */
async function aiBankGateway(bankReq) {
  const prompt = `
You are AI BankGateway. Assess the following bank/system integration for completeness, regulatory compliance, and readiness. List missing elements and provide recommendations.

Integration Request:
${JSON.stringify(bankReq, null, 2)}

Return as:
isReady: true/false
missingElements: <string>
complianceStatus: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.10,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      isReady: false,
      missingElements: "Parsing error",
      complianceStatus: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiBankGateway };