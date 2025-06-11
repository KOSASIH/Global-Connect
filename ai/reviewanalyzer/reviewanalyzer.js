const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function analyzeReviews(reviews) {
  const prompt = `Analyze the following product reviews for overall sentiment (positive, negative, neutral) and main themes or concerns. Respond with a summary.
  Reviews:
  ${reviews.map((r, i) => `${i+1}. ${r}`).join('\n')}`;

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { analyzeReviews };