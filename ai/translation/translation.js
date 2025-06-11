const axios = require('axios');
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function translate(text, targetLang = "en") {
  const response = await axios.post(
    `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
    { q: text, target: targetLang }
  );
  return response.data.data.translations[0].translatedText;
}

module.exports = { translate };