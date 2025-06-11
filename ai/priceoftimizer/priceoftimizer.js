const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function suggestOptimalPrice(product, competitors, targetMarket) {
  const prompt = `Given the following product description: ${product}
  Competitor prices: ${competitors.join(', ')}
  Target market: ${targetMarket}
  Suggest an optimal sales price and briefly explain your reasoning.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.6
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { suggestOptimalPrice };