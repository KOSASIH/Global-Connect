const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generates professional documentation or a README based on project details.
 * @param {Object} docSpec - { projectName, description, usage, features, install, api, contact }
 * @returns {Promise<{markdownDoc: string}>}
 */
async function aiDocGen(docSpec) {
  const prompt = `
You are an AI DocGen. Write a complete, professional README.md or documentation section for this project.
Details:
${JSON.stringify(docSpec, null, 2)}
Return as:
markdownDoc: <string>
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
    return { markdownDoc: "Parsing error. Please check your docSpec format." };
  }
}

module.exports = { aiDocGen };