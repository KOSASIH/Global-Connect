const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Automates the full KYC workflow: ID collection, document matching, liveness/selfie check, risk scoring.
 * @param {Object} kycWorkflow - { userId, docsSubmitted, selfie, matchScore, livenessScore, riskScore }
 * @returns {Promise<{workflowStatus: string, matchStatus: string, livenessStatus: string, riskScore: string, recommendations: string}>}
 */
async function aiAutoKYC(kycWorkflow) {
  const prompt = `
You are AI AutoKYC. Orchestrate and evaluate the following KYC onboarding workflow, including document matching, selfie/liveness, and risk scoring.
Return status of workflow, document match, liveness, risk, and recommendations.

KYC Workflow:
${JSON.stringify(kycWorkflow, null, 2)}

Return as:
workflowStatus: <string>
matchStatus: <string>
livenessStatus: <string>
riskScore: <string>
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
      workflowStatus: "Parsing error",
      matchStatus: "Parsing error",
      livenessStatus: "Parsing error",
      riskScore: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiAutoKYC };