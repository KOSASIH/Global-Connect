const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateFAQ(context) {
  const prompt = `Based on the following product/store information, generate a list of 5 frequently asked questions (FAQ) with concise answers:\n\n${context}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateFAQ };