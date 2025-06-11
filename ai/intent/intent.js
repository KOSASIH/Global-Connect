const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function detectIntent(text) {
  const prompt = `What is the user's intent in the following message? Just give the intent category and a short explanation:\n\n${text}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.5
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { detectIntent };