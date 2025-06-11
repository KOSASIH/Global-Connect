const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generates API endpoint specifications, sample code, and auto-documentation.
 * @param {Object} apiSpec - { resource, actions, auth, dataModel }
 * @returns {Promise<{endpoints: Array, sampleCode: string, apiDocs: string}>}
 */
async function aiApiBuilder(apiSpec) {
  const prompt = `
You are an AI APIBuilder. For the following spec, generate endpoint definitions, sample code (Node.js Express), and Markdown API documentation.
API Spec:
${JSON.stringify(apiSpec, null, 2)}
Return as:
endpoints: [list]
sampleCode: <string>
apiDocs: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.15,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      endpoints: [],
      sampleCode: "Parsing error",
      apiDocs: ""
    };
  }
}

module.exports = { aiApiBuilder };