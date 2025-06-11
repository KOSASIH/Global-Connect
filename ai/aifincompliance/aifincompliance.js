const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Validates financial transactions and integrations for AML, KYC, and regulatory compliance.
 * @param {Object} finReq - { transaction, userInfo, destination, amount, complianceContext }
 * @returns {Promise<{isCompliant: boolean, riskLevel: string, issues: string, recommendations: string}>}
 */
async function aiFinCompliance(finReq) {
  const prompt = `
You are AI FinCompliance. Analyze the following financial transaction or integration for AML/KYC/compliance. Report compliance, risk, issues, and recommendations.

Request:
${JSON.stringify(finReq, null, 2)}

Return as:
isCompliant: true/false
riskLevel: <string>
issues: <string>
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
      isCompliant: false,
      riskLevel: "Parsing error",
      issues: "Parsing error",
      recommendations: "Manual compliance review required"
    };
  }
}

module.exports = { aiFinCompliance };