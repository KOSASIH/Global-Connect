/**
 * Generates an audit trail or summary for PiDualTx compliance.
 * @param {Array} records - Array of transaction or state records.
 * @returns {Object}
 */
function generatePiDualTxAudit(records) {
  const internal = records.filter(r => r.ledger === "internal");
  const external = records.filter(r => r.ledger === "external");
  return {
    totalInternalTx: internal.length,
    totalExternalTx: external.length,
    suspiciousMixing: records.filter(r => r.ledger === "mixed").length,
    notes: "All records should show clear separation between internal and external ledgers according to PiDualTx.",
    warnings:
      records.some(r => r.ledger === "mixed")
        ? "Detected possible mixing between internal and external Pi. Review required!"
        : "No mixing detected. System is compliant."
  };
}

module.exports = { generatePiDualTxAudit };