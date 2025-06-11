const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function analyzeContract(contractText) {
  const prompt = `Analyze the following contract. Summarize the key terms, obligations, risks, and any unusual clauses:\n\n${contractText}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { analyzeContract };