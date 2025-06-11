const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Allowed origins for the internal ecosystem
const ALLOWED_ORIGINS = [
  "mining",         // mined Pi Coin
  "peer-to-peer",   // direct user transfer (not from an exchange)
  "contribution"    // project/reward contribution
];

// Check if Pi Coin is eligible for the Purify badge 🌟 and internal value
async function checkPiPurity(piCoinInfo) {
  /**
   * piCoinInfo: {
   *   txHistory: [{type, from, to, source, timestamp, viaExchange}],
   *   mined: boolean,
   *   contribution: boolean,
   *   peerToPeer: boolean,
   *   everOnExternalExchange: boolean,
   *   origin: "mining" | "peer-to-peer" | "contribution" | "exchange" | etc
   * }
   */
  let eligible = false;
  let reason = "";

  // Only mined, P2P, or contribution, and never external exchange
  if (
    ALLOWED_ORIGINS.includes(piCoinInfo.origin) &&
    !piCoinInfo.everOnExternalExchange
  ) {
    eligible = true;
    reason = `Pi Coin originated from ${piCoinInfo.origin} and has never been to an external exchange. Eligible for Purify badge 🌟 and valued at 1 Pi = $314,159 within the internal ecosystem.`;
  } else {
    eligible = false;
    if (!ALLOWED_ORIGINS.includes(piCoinInfo.origin)) {
      reason = "Pi Coin did not originate from mining, peer-to-peer, or contribution.";
    } else if (piCoinInfo.everOnExternalExchange) {
      reason = "Pi Coin has been on an external exchange and is not eligible for the Purify badge 🌟.";
    } else {
      reason = "Pi Coin origin is not valid for the internal ecosystem.";
    }
  }

  // Optional: Use AI for deeper transaction history analysis if needed
  if (piCoinInfo.txHistory && piCoinInfo.txHistory.length > 0) {
    const prompt = `
Analyze the following transaction history for a Pi Coin.
Criteria for getting the Purify badge (🌟) and a value of 1 Pi = $314,159:
- Pi Coin must originate only from mining, peer-to-peer, or contribution.
- It must never have been to any external exchange.
Transaction history:
${JSON.stringify(piCoinInfo.txHistory, null, 2)}
Is this Pi Coin eligible for the Purify badge? Explain briefly.
Answer format:
eligible: true/false
reason: <short explanation>
    `;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const txt = response.data.choices[0].message.content;
    const matchEligible = txt.match(/eligible\s*:\s*(true|false)/i);
    const matchReason = txt.match(/reason\s*:\s*(.*)/i);
    if (matchEligible) eligible = matchEligible[1].toLowerCase() === "true";
    if (matchReason) reason = matchReason[1].trim();
  }

  return {
    eligible,
    reason,
    valueUSD: eligible ? 314159 : 0,
    badge: eligible ? "🌟" : ""
  };
}

module.exports = { checkPiPurity };
