const axios = require('axios');

// Purified Pi Coin fixed rate
const PI_RATE_USD = 314159; // 1 Pi = $314,159

/**
 * Convert an amount from any supported currency to Pi Coin or vice versa.
 * @param {number} amount
 * @param {string} fromCurrency - e.g. "USD", "EUR", "PI"
 * @param {string} toCurrency   - e.g. "USD", "EUR", "PI"
 * @returns {Promise<string>}
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  // Normalize
  fromCurrency = fromCurrency.toUpperCase();
  toCurrency = toCurrency.toUpperCase();

  // Special handling for PI
  if (fromCurrency === "PI" && toCurrency === "USD") {
    return (amount * PI_RATE_USD).toFixed(2) + " USD";
  }
  if (fromCurrency === "USD" && toCurrency === "PI") {
    return (amount / PI_RATE_USD).toFixed(8) + " PI";
  }
  if (fromCurrency === "PI") {
    // Convert Pi -> USD -> Other
    const usd = amount * PI_RATE_USD;
    const rate = await getRate("USD", toCurrency);
    return (usd * rate).toFixed(2) + " " + toCurrency;
  }
  if (toCurrency === "PI") {
    // Convert Other -> USD -> Pi
    const rate = await getRate(fromCurrency, "USD");
    const usd = amount * rate;
    return (usd / PI_RATE_USD).toFixed(8) + " PI";
  }
  // Standard currency conversion
  const rate = await getRate(fromCurrency, toCurrency);
  return (amount * rate).toFixed(2) + " " + toCurrency;
}

// Helper: fetch exchange rates using exchangerate.host API
async function getRate(from, to) {
  if (from === to) return 1;
  const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}`;
  const { data } = await axios.get(url);
  return data.info.rate;
}

module.exports = { convertCurrency };