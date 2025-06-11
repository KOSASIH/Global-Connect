const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analyzes KYC documents and identity data for authenticity and compliance.
 * @param {Object} kycData - { userId, idDocumentType, idNumber, name, dob, country, selfieImage, docImage }
 * @returns {Promise<{isValid: boolean, detectedIssues: string, riskLevel: string, recommendations: string}>}
 */
async function aiKYCValidator(kycData) {
  const prompt = `
You are AI KYCValidator. Review the following KYC data for authenticity, regulatory compliance, and potential fraud.
Clearly state if KYC is valid, issues detected, risk level, and recommendations.

KYC Data:
${JSON.stringify(kycData, null, 2)}

Return as:
isValid: true/false
detectedIssues: <string>
riskLevel: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.12,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      isValid: false,
      detectedIssues: "Parsing error",
      riskLevel: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiKYCValidator };