const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateMarketInsights(newsSnippets) {
  const prompt = `Given these recent business/news reports:\n${newsSnippets.join('\n\n')}\n
Summarize the current market trends, opportunities, and risks in a concise report.`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateMarketInsights };