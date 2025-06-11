const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Monitors and validates the full payment flow (Pi, fiat, banks, gateways) for latency, errors, and completeness.
 * @param {Object} paymentFlow - { source, destination, amount, currency, steps, status, timestamps }
 * @returns {Promise<{flowHealthy: boolean, bottlenecks: string, failedSteps: string, recommendations: string}>}
 */
async function aiPaymentRailMonitor(paymentFlow) {
  const prompt = `
You are AI PaymentRailMonitor. Monitor and validate this payment flow (Pi, fiat, bank, gateway) for latency, errors, and process completeness. Report any bottlenecks, failed steps, and make recommendations.

Payment Flow:
${JSON.stringify(paymentFlow, null, 2)}

Return as:
flowHealthy: true/false
bottlenecks: <string>
failedSteps: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.10,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      flowHealthy: false,
      bottlenecks: "Parsing error",
      failedSteps: "Parsing error",
      recommendations: "Manual review required"
    };
  }
}

module.exports = { aiPaymentRailMonitor };