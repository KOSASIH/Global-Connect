const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const { convertCurrency } = require('../currencyconverter/currencyconverter');

async function generateFinanceReport(transactions, preferPi = false) {
  // Convert all to Pi if requested
  let normalized = transactions;
  if (preferPi) {
    normalized = await Promise.all(transactions.map(async tx => {
      if (tx.currency.toUpperCase() !== "PI") {
        const amountInPi = await convertCurrency(tx.amount, tx.currency, "PI");
        return { ...tx, amount: parseFloat(amountInPi), currency: "PI" };
      }
      return tx;
    }));
  }
  const prompt = `Given these transactions:\n${JSON.stringify(normalized, null, 2)}\nSummarize total spending, income, and balances. Use Pi Coin as base currency if possible.`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.3
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = { generateFinanceReport };