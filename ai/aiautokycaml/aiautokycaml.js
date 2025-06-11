const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Runs KYC and AML checks together for a user/onboarding event.
 * @param {Object} kycAmlData - { userId, kycStatus, amlFlags, country, sanctionsCheck, pepCheck }
 * @returns {Promise<{isApproved: boolean, kycStatus: string, amlFindings: string, riskLevel: string, recommendations: string}>}
 */
async function aiAutoKYCAML(kycAmlData) {
  const prompt = `
You are AI AutoKYCAML. Analyze the following for both KYC and AML risks, including sanctions and PEP checks.
Return if user is approved, KYC status, AML findings, risk level, and recommendations.

KYC/AML Data:
${JSON.stringify(kycAmlData, null, 2)}

Return as:
isApproved: true/false
kycStatus: <string>
amlFindings: <string>
riskLevel: <string>
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
      isApproved: false,
      kycStatus: "Parsing error",
      amlFindings: "Parsing error",
      riskLevel: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiAutoKYCAML };