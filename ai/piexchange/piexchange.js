const { assignPurifyBadge } = require('../assetbadges/assetbadges');
const { convertCurrency } = require('../currencyconverter/currencyconverter');

const PI_RATE_USD = 314159; // 1 Pi = $314,159

// In-memory order book (for demo; replace with DB in prod)
const orderBook = {
  buy: [], // {user, amount, price, badge}
  sell: []
};

// List Pi Coin on the exchange, but only if Purify badge (🌟)
async function listPiCoin(amount, user, badgeInfo) {
  if (!badgeInfo || !badgeInfo.purified) {
    throw new Error("Only Purified (🌟) Pi Coin can be listed.");
  }
  return { success: true, message: "Pi Coin listed with Purify badge 🌟!", details: { amount, user, badge: badgeInfo } };
}

// Place buy/sell order (only Purified Pi allowed)
async function placeOrder(type, user, amount, priceUSD, assetInfo) {
  if (assetInfo.type !== "Pi Coin") throw new Error("Only Pi Coin supported.");
  const badge = await assignPurifyBadge(assetInfo);
  if (!badge.purified) throw new Error("Asset must have Purify badge 🌟.");
  const order = { user, amount, price: priceUSD, badge: badge.purified, assetInfo };
  orderBook[type].push(order);
  return order;
}

// Get order book (buy/sell orders visible, Pi only)
function getOrderBook() {
  return {
    buy: orderBook.buy,
    sell: orderBook.sell
  };
}

// Instant market conversion (always 1 Pi = $314,159)
async function marketConvert(amount, from, to) {
  return convertCurrency(amount, from, to);
}

module.exports = {
  listPiCoin,
  placeOrder,
  getOrderBook,
  marketConvert,
  PI_RATE_USD
};