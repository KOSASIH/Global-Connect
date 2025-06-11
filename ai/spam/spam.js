const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function detectSpam(text) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [
        {role: "user", content: `Is the following text spam? Answer yes or no and explain: ${text}`}
      ],
      temperature: 0.3
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { detectSpam };