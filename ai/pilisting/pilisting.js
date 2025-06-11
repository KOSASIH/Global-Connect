/**
 * Validate a listing request.
 * Only allow Pi Coin (from Pi Network), require Purify badge (🌟), and provide reason.
 * @param {object} assetDetails - { type, network, purified }
 * @returns {object}
 */
function validatePiListing(assetDetails) {
  let valid = assetDetails.type === "Pi Coin" && assetDetails.network === "Pi Network" && assetDetails.purified;
  let reason = "";
  if (!valid) {
    if (assetDetails.type !== "Pi Coin") reason = "Asset must be Pi Coin.";
    else if (assetDetails.network !== "Pi Network") reason = "Pi Coin must originate from Pi Network.";
    else if (!assetDetails.purified) reason = "Only Purified (🌟) Pi Coin is allowed.";
  } else {
    reason = "Listing approved for Purified (🌟) Pi Coin from Pi Network.";
  }
  return { valid, reason };
}

module.exports = { validatePiListing };