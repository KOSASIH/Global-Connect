const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function scoreLead(leadProfile, idealCustomerProfile) {
  const prompt = `Given the following sales lead profile:\n${JSON.stringify(leadProfile, null, 2)}\n
And this is our ideal customer profile:\n${JSON.stringify(idealCustomerProfile, null, 2)}\n
Score the lead from 1 (poor fit) to 10 (perfect fit) and explain your reasoning.`;
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

module.exports = { scoreLead };