const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Designs and generates multi-step workflow logic for apps or business processes.
 * @param {Object} workflowSpec - { processName, steps, triggers, integrations }
 * @returns {Promise<{workflowDiagram: string, stepDefinitions: Array, automationCode: string}>}
 */
async function aiWorkflowBuilder(workflowSpec) {
  const prompt = `
You are an AI WorkflowBuilder. For this process, generate a workflow diagram (markdown), step-by-step definitions, and automation code (Node.js or Python).
Spec:
${JSON.stringify(workflowSpec, null, 2)}
Return as:
workflowDiagram: <string>
stepDefinitions: [list]
automationCode: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.16,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      workflowDiagram: "Parsing error",
      stepDefinitions: [],
      automationCode: ""
    };
  }
}

module.exports = { aiWorkflowBuilder };