const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Assesses the security and compliance of bank API endpoints.
 * @param {Object} apiInfo - { endpoint, method, authScheme, lastAudit, recentIncidents, geoRestrictions }
 * @returns {Promise<{isSecure: boolean, complianceStatus: string, securityFindings: string, recommendations: string}>}
 */
async function aiBankAPIGuard(apiInfo) {
  const prompt = `
You are AI BankAPIGuard. Assess the following bank API endpoint for security, compliance, and potential risks.
Clearly state if the endpoint is secure, compliance status, findings, and recommendations.

API Info:
${JSON.stringify(apiInfo, null, 2)}

Return as:
isSecure: true/false
complianceStatus: <string>
securityFindings: <string>
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
      isSecure: false,
      complianceStatus: "Parsing error",
      securityFindings: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiBankAPIGuard };