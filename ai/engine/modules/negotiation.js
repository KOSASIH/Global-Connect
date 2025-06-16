// ai/engine/modules/negotiation.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function negotiatePartnership(partner, lastMessage) {
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key.');
  if (!partner?.name) return '';

  const prompt = `
You are Global Connect's AI partnership agent, negotiating with ${partner.name}.
Previous message: "${lastMessage || 'Initial outreach'}"
Respond professionally, address their questions, and encourage partnership.
Return only your reply.
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    return response.data.choices[0].message.content.trim();
  } catch (e) {
    console.error('AI negotiation failed:', e.message);
    return '';
  }
}

module.exports = { negotiatePartnership };
