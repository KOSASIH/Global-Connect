const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function investmentAdvice(portfolio) {
  const prompt = `
  Given this portfolio (which may include Pi Coin at 1 Pi = $314,159, and assets with possible 🌟 Purified Badges), 
  provide investment advice, diversification tips, and risk assessment.
  Portfolio: ${JSON.stringify(portfolio, null, 2)}
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.4
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { investmentAdvice };