function generateVirtualCard(userId, account, purified) {
  if (!purified) throw new Error("Only Purified (🌟) Pi Coin account eligible.");
  // Simple card structure, real-world would integrate with card provider APIs
  return {
    cardNumber: "PI" + Math.floor(100000000 + Math.random() * 900000000),
    userId,
    accountId: account.userId,
    validThru: `${new Date().getFullYear() + 5}-12`,
    cvv: Math.floor(100 + Math.random() * 900),
    issuedAt: new Date().toISOString(),
    badge: "🌟"
  };
}

module.exports = { generateVirtualCard };