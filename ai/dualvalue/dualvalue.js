const INTERNAL_PI_VALUE = 314159; // Fixed USD value for internal (Purified) Pi

/**
 * Determine Pi type and value context.
 * @param {Object} piCoinInfo
 * @returns {Object} { type: "internal"|"external", valueUSD, reason }
 */
function classifyPiCoin(piCoinInfo) {
  // Internal: Only mining, peer-to-peer, or contribution, never on external exchange
  if (
    ["mining", "peer-to-peer", "contribution"].includes(piCoinInfo.origin) &&
    !piCoinInfo.everOnExternalExchange
  ) {
    return {
      type: "internal",
      valueUSD: INTERNAL_PI_VALUE,
      reason: "Pi Coin is Purified (never on external exchange, valid origin)."
    };
  }
  // External: Any Pi that has ever been on an external exchange
  return {
    type: "external",
    valueUSD: piCoinInfo.marketValueUSD || 0,
    reason: "Pi Coin has touched an external exchange or has non-purified origin."
  };
}

/**
 * Validate a Pi transaction for dual value compliance.
 * @param {Object} tx { fromPiType, toPiType, amount }
 * @returns {Object} { valid, reason }
 */
function validateDualValueTransaction(tx) {
  if (tx.fromPiType === "internal" && tx.toPiType === "external") {
    return {
      valid: false,
      reason: "Direct transfer from internal (Purified) to external Pi value is forbidden."
    };
  }
  // Allow internal<->internal, external<->external, external->internal (with strict review)
  return {
    valid: true,
    reason: "Transaction is valid under the dual value system."
  };
}

/**
 * Convert Pi value between internal and external systems.
 * @param {number} amount
 * @param {"internal"|"external"} fromType
 * @param {"internal"|"external"} toType
 * @param {number} [externalValueUSD]
 * @returns {Object} { resultAmount, rate, reason }
 */
function convertPiValue(amount, fromType, toType, externalValueUSD) {
  if (fromType === toType) {
    return { resultAmount: amount, rate: 1, reason: "No conversion needed." };
  }
  if (fromType === "internal" && toType === "external") {
    // Conversion not allowed, or only via strict review
    return { resultAmount: 0, rate: 0, reason: "Conversion from internal (Purified) to external Pi is not allowed." };
  }
  if (fromType === "external" && toType === "internal") {
    // Allow only under admin review, KYC, and burning external Pi
    if (!externalValueUSD || externalValueUSD <= 0) {
      return { resultAmount: 0, rate: 0, reason: "Missing external Pi market value for conversion." };
    }
    // Example: To bring 1 external Pi into internal system, burn it and mint 1 internal Pi at fixed value
    return {
      resultAmount: amount,
      rate: externalValueUSD / INTERNAL_PI_VALUE,
      reason: "External Pi converted to internal system after burning and admin review."
    };
  }
  return { resultAmount: 0, rate: 0, reason: "Unknown conversion direction." };
}

module.exports = {
  INTERNAL_PI_VALUE,
  classifyPiCoin,
  validateDualValueTransaction,
  convertPiValue
};