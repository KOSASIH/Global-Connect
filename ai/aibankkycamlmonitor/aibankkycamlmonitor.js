const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Validates KYC/AML status for any user, institution, or transaction across global banking systems.
 * @param {Object} kycAmlRequest - { user, institution, country, txDetails, kycDocs, amlFlags }
 * @returns {Promise<{isCompliant: boolean, issues: string, riskAssessment: string, recommendations: string}>}
 */
async function aiBankKYCAML(kycAmlRequest) {
  const prompt = `
You are AI BankKYCAML. Analyze and validate KYC/AML compliance for the following user, institution, or transaction in a global banking context.
Clearly state compliance, issues, risk, and recommendations.

Request:
${JSON.stringify(kycAmlRequest, null, 2)}

Return as:
isCompliant: true/false
issues: <string>
riskAssessment: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.11,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      isCompliant: false,
      issues: "Parsing error",
      riskAssessment: "Parsing error",
      recommendations: "Manual compliance review required"
    };
  }
}

module.exports = { aiBankKYCAML };