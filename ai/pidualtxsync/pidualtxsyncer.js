/**
 * Scans and suggests corrections for PiDualTx system misalignments.
 * @param {Array} systemState - Array of objects representing wallets, ledgers, or subsystems.
 * @returns {Array} suggestions - Array of {component, issue, suggestion}
 */
function suggestPiDualTxCorrections(systemState) {
  return systemState.flatMap(component => {
    const suggestions = [];
    if (component.ledger === "mixed") {
      suggestions.push({
        component: component.name,
        issue: "Mixed ledger detected",
        suggestion: "Split this ledger into separate internal and external ledgers as per PiDualTx rules."
      });
    }
    if (component.internalBalance && component.externalBalance && component.internalBalance < 0) {
      suggestions.push({
        component: component.name,
        issue: "Negative internal balance",
        suggestion: "Investigate for possible unauthorized value leakage."
      });
    }
    if (component.hasConversionWithoutKYC) {
      suggestions.push({
        component: component.name,
        issue: "Conversion without KYC detected",
        suggestion: "Block conversion and require KYC verification before proceeding."
      });
    }
    return suggestions;
  });
}

module.exports = { suggestPiDualTxCorrections };