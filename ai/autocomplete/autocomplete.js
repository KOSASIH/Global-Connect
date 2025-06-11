const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function autocomplete(prompt, maxTokens=20) {
  const response = await axios.post(
    'https://api.openai.com/v1/completions',
    {
      model: "text-davinci-003",
      prompt,
      max_tokens: maxTokens,
      temperature: 0.7
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.choices[0].text.trim();
}

module.exports = { autocomplete };