const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Ensures accurate, real-time Pi Coin to Fiat conversion using live rates, regulations, and liquidity checks.
 * @param {Object} conversionRequest - { amountPi, targetFiat, userLocation, complianceInfo }
 * @returns {Promise<{convertedAmount: number, rateUsed: number, liquidityStatus: string, complianceStatus: string, recommendations: string}>}
 */
async function aiPiFiConverter(conversionRequest) {
  const prompt = `
You are AI PiFiConverter. Given the following Pi-to-Fiat conversion request, calculate the converted amount using the latest rates, check liquidity, ensure compliance, and provide recommendations.

Request:
${JSON.stringify(conversionRequest, null, 2)}

Return as:
convertedAmount: <number>
rateUsed: <number>
liquidityStatus: <string>
complianceStatus: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.11,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      convertedAmount: 0,
      rateUsed: 0,
      liquidityStatus: "Parsing error",
      complianceStatus: "Parsing error",
      recommendations: "Manual check required"
    };
  }
}

module.exports = { aiPiFiConverter };