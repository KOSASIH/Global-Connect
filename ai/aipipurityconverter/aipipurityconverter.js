const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Supported major cryptos for demonstration; you can extend this list as needed.
const CRYPTO_RATES = {
  'BTC': 67000,   // Example: 1 BTC = $67,000
  'ETH': 3700,    // Example: 1 ETH = $3,700
  'USDT': 1,
  'USDC': 1,
  // ... Add more as needed
};

const FIXED_PI_USD = 314159;

/**
 * Converts Pi (with purity badge 🌟) to any fiat or crypto using the fixed rate.
 * @param {Object} req - { amountPi, toCurrency, isPurityBadge }
 * @returns {Promise<{convertedAmount: number, rateUsed: string, purity: boolean, note: string}>}
 */
async function aiPiPurityConverter(req) {
  const { amountPi, toCurrency, isPurityBadge } = req;

  if (!isPurityBadge) {
    return {
      convertedAmount: 0,
      rateUsed: "0",
      purity: false,
      note: "Only Pi coins with purity badge (🌟) can be converted using this engine."
    };
  }

  let usdValue = amountPi * FIXED_PI_USD;
  let convertedAmount, rateUsed;

  // Fiat conversion (assume USD, EUR, etc. use latest rates from OpenAI or a fallback)
  if (toCurrency === 'USD') {
    convertedAmount = usdValue;
    rateUsed = `1 Pi 🌟 = $${FIXED_PI_USD} USD (fixed)`;
  } else if (CRYPTO_RATES[toCurrency]) {
    convertedAmount = usdValue / CRYPTO_RATES[toCurrency];
    rateUsed = `1 Pi 🌟 = $${FIXED_PI_USD} USD = ${FIXED_PI_USD / CRYPTO_RATES[toCurrency]} ${toCurrency} (fixed, example rate)`;
  } else {
    // For non-USD fiat, get conversion rate via OpenAI or fallback to USD
    try {
      const prompt = `Convert $${usdValue} USD to ${toCurrency} using the latest available market rate. Just return the number as result.`;
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
          temperature: 0,
        },
        { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
      );
      const result = parseFloat(response.data.choices[0].message.content.replace(/[^0-9.]/g, ""));
      convertedAmount = result;
      rateUsed = `1 Pi 🌟 = $${FIXED_PI_USD} USD = ${toCurrency} (via OpenAI FX rate)`;
    } catch {
      convertedAmount = usdValue;
      rateUsed = `1 Pi 🌟 = $${FIXED_PI_USD} USD (fallback, no FX rate found)`;
    }
  }

  return {
    convertedAmount,
    rateUsed,
    purity: true,
    note: "Conversion used fixed value for Pi with purity badge (🌟)."
  };
}

module.exports = { aiPiPurityConverter };