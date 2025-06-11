/**
 * Generate a transparency report for Pi Coin reserves, all assets must be Purified (🌟).
 * @param {object[]} piHoldings - [{wallet, amount, purified, lastAudit}]
 * @returns {object}
 */
function generatePiTransparencyReport(piHoldings) {
  const purifiedTotal = piHoldings.filter(h => h.purified).reduce((sum, h) => sum + h.amount, 0);
  const nonPurified = piHoldings.filter(h => !h.purified);
  return {
    totalPurifiedPi: purifiedTotal,
    totalWallets: piHoldings.length,
    nonPurifiedHoldings: nonPurified,
    proofOfReserves: purifiedTotal,
    auditStatus: nonPurified.length === 0 ? "All reserves are Purified (🌟)" : "Some non-purified Pi detected, review required"
  };
}

module.exports = { generatePiTransparencyReport };