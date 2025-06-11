const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Allowed origins for internal ecosystem
const ALLOWED_ORIGINS = [
  "mining",         // hasil penambangan
  "peer-to-peer",   // transfer antar pengguna (bukan exchange)
  "contribution"    // reward/kontribusi pada proyek
];

// Check if Pi Coin is eligible for Purify badge 🌟 and internal value
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

  // Logic check: Only mined, P2P, or contribution, and never external exchange
  if (
    ALLOWED_ORIGINS.includes(piCoinInfo.origin) &&
    !piCoinInfo.everOnExternalExchange
  ) {
    eligible = true;
    reason = "Pi Coin berasal dari " + piCoinInfo.origin +
      " dan belum pernah ke bursa eksternal. Layak untuk Purify badge 🌟 dan dinilai 1 Pi = $314,159 secara internal.";
  } else {
    eligible = false;
    if (!ALLOWED_ORIGINS.includes(piCoinInfo.origin)) {
      reason = "Pi Coin bukan hasil mining, peer-to-peer, atau kontribusi.";
    } else if (piCoinInfo.everOnExternalExchange) {
      reason = "Pi Coin pernah masuk ke bursa eksternal, tidak layak untuk Purify badge 🌟.";
    } else {
      reason = "Asal-usul Pi Coin tidak valid untuk ekosistem internal.";
    }
  }

  // Optional: Use AI for further analysis of transaction history for complex cases
  if (piCoinInfo.txHistory && piCoinInfo.txHistory.length > 0) {
    const prompt = `
Analisa riwayat transaksi berikut untuk sebuah Pi Coin.
Kriteria untuk mendapatkan Purify badge (🌟) dan nilai 1 Pi = $314,159:
- Pi Coin hanya hasil mining, peer-to-peer, atau kontribusi.
- Tidak pernah masuk ke bursa eksternal.
Riwayat transaksi:
${JSON.stringify(piCoinInfo.txHistory, null, 2)}
Apakah Pi Coin ini layak mendapatkan Purify badge? Jelaskan alasannya secara singkat (Bahasa Indonesia boleh).
Jawaban dalam format:
eligible: true/false
reason: <penjelasan>
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