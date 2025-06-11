const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateMeetingNotes(transcript) {
  const prompt = `Summarize the following meeting transcript into action items, decisions, and key discussion points:\n\n${transcript}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateMeetingNotes };