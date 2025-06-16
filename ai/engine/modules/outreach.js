// ai/engine/modules/outreach.js
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateOutreach(partner, context) {
  if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key.');
  if (!partner?.name || !partner?.contact) return '';

  const prompt = `
Write a persuasive, professional email inviting ${partner.name} to a strategic partnership with Global Connect.
Context: ${context || 'Highlight AI, compliance, and global scaling advantages.'}
Partner details: ${JSON.stringify(partner)}
Return only the email body, no headers.
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
    console.error('AI outreach generation failed:', e.message);
    return '';
  }
}

module.exports = { generateOutreach };
