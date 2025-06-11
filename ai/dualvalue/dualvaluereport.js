/**
 * Generate a compliance report of dual value system status.
 * @param {Array} piHoldings - [{ wallet, type, amount, origin, everOnExternalExchange }]
 * @returns {Object}
 */
function generateDualValueReport(piHoldings) {
  const internal = piHoldings.filter(h => h.type === "internal");
  const external = piHoldings.filter(h => h.type === "external");
  return {
    totalInternal: internal.reduce((sum, h) => sum + h.amount, 0),
    totalExternal: external.reduce((sum, h) => sum + h.amount, 0),
    internalWallets: internal.length,
    externalWallets: external.length,
    notes: "Only internal Pi (Purified, never on external exchange) is valid for internal ecosystem value.",
    warnings: external.length > 0 ? "External Pi detected. Segregate from internal ecosystem strictly." : "No external Pi in internal ecosystem."
  };
}

module.exports = { generateDualValueReport };