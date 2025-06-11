const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function summarizeDocuments(query, documents) {
  const prompt = `Summarize the following documents in relation to the query: "${query}"\n\n${documents.join('\n\n')}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.6
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.choices[0].message.content;
}

module.exports = { summarizeDocuments };