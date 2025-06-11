const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function recommendProducts(preferences, catalog) {
  const prompt = `User preferences: ${preferences.join(', ')}
  Product catalog: ${catalog.map(p => `${p.name} (${p.features.join(', ')})`).join('; ')}
  Recommend 3 products from the catalog that best match the user's preferences and explain why.`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.7
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { recommendProducts };