const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function predictChurn(customerHistory) {
  const prompt = `Given the following customer history, predict the likelihood (as a percentage) that this customer will churn and explain your reasoning:\n${JSON.stringify(customerHistory, null, 2)}`;
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

module.exports = { predictChurn };