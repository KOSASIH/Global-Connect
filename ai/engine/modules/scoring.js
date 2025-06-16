// ai/engine/modules/scoring.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function scorePartners(partners, criteria) {
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key.');
  if (!Array.isArray(partners) || partners.length === 0) return [];

  const prompt = `
You are an advanced AI evaluating potential strategic partners for a global fintech platform.
Criteria: ${criteria ? JSON.stringify(criteria) : 'Strategic fit, compliance readiness, user base, market potential, tech synergy.'}
Partners: ${JSON.stringify(partners)}
For each partner, assign a score from 0-100 and briefly explain the main reason for the score.
Return JSON: [ { name, score, reason } ]
`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    // Extract JSON array from the response
    const match = response.data.choices[0].message.content.match(/\[.*\]/s);
    if (!match) throw new Error('AI response format error');
    return JSON.parse(match[0]);
  } catch (e) {
    console.error('AI scoring failed:', e.message);
    return partners.map(p => ({
      name: p.name,
      score: 50,
      reason: "Default score due to AI scoring failure."
    }));
  }
}

module.exports = { scorePartners };
