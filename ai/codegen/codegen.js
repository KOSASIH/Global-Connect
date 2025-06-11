const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateCode(prompt, language = "JavaScript") {
  const fullPrompt = `Write a code snippet in ${language} that does the following:\n${prompt}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.4
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateCode };