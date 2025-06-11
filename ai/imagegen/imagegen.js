const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateImage(prompt) {
  const response = await axios.post(
    'https://api.openai.com/v1/images/generations',
    {
      model: "dall-e-3",
      prompt
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
    }
  );
  return response.data.data[0].url; // Returns URL of generated image
}

module.exports = { generateImage };