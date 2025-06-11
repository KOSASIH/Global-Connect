const PI_RATE_USD = 314159; // 1 Pi = $314,159

/**
 * Get the current Pi Coin price in supported fiat currencies.
 * Only returns price if asset is Purified (🌟).
 * @param {object} assetInfo
 * @param {string[]} fiats
 * @returns {object}
 */
function getPiPrice(assetInfo, fiats = ['USD']) {
  if (!assetInfo.purified) throw new Error("Only Purified (🌟) Pi Coin has a stable price.");
  const result = {};
  fiats.forEach(fiat => {
    result[fiat] = PI_RATE_USD;
  });
  return result;
}

module.exports = { getPiPrice, PI_RATE_USD };