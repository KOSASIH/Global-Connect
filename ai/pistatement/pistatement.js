const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateStatement(accountData, type = "account") {
  const prompt = `Generate a clear and compliant ${type} statement, with a summary and list of transactions. Use Pi Coin and Purify (🌟) badge context.
Data: ${JSON.stringify(accountData, null, 2)}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateStatement };