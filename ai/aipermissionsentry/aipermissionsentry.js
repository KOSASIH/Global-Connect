const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Analyzes user permissions and access patterns for risks or privilege escalations.
 * @param {Object} permissionData - { userId, roles, actions, resources, context }
 * @returns {Promise<{riskDetected: boolean, riskLevel: string, findings: string, mitigation: string}>}
 */
async function aiPermissionSentry(permissionData) {
  const prompt = `
You are an AI PermissionSentry. Analyze the following permissions and access patterns for risk of privilege escalation, over-permission, or abuse. Clearly state if risk is detected, its level, findings, and mitigation.

Permission Data:
${JSON.stringify(permissionData, null, 2)}

Return as:
riskDetected: true/false
riskLevel: <string>
findings: <string>
mitigation: <string>
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
      riskDetected: true,
      riskLevel: "High",
      findings: "Parsing error",
      mitigation: "Manual review required"
    };
  }
}

module.exports = { aiPermissionSentry };