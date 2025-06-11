const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function chat(message, conversationHistory = []) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [
        ...conversationHistory,
        {role: "user", content: message}
      ],
      temperature: 0.7
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.choices[0].message.content;
}

module.exports = { chat };