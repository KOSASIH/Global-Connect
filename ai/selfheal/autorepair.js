const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Suggest code changes or patches based on a stack trace or error log.
 * @param {string} errorLog
 * @param {string} sourceSnippet (optional)
 * @returns {Promise<{explanation:string, patch:string}>}
 */
async function suggestAutoRepair(errorLog, sourceSnippet = "") {
  const prompt = `
You are an AI DevOps tool for Global-Connect.
Given this error log/stack trace:
${errorLog}
${sourceSnippet ? "\nRelevant code:\n" + sourceSnippet : ""}

1. Explain the root cause.
2. Suggest a patch (single code block only, if possible).
Respond as:
explanation: <explanation>
patch: <code>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.2
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  const txt = response.data.choices[0].message.content;
  const matchExplanation = txt.match(/explanation:([\s\S]*?)patch:/i);
  const matchPatch = txt.match(/patch:\s*(```[\s\S]*?```|[\s\S]*)/i);
  return {
    explanation: matchExplanation ? matchExplanation[1].trim() : txt,
    patch: matchPatch ? matchPatch[1].replace(/(^```[a-zA-Z]*|```$)/g,'').trim() : ""
  };
}

module.exports = { suggestAutoRepair };