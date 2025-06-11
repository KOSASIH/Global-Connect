const QRCode = require('qrcode');

/**
 * Generate payment details and a QR code for a Pi Coin transaction.
 * @param {string} recipient - Pi Coin address or account
 * @param {number} amountPi  - Amount in Pi
 * @param {string} memo      - Optional memo/note
 * @returns {Promise<{paymentUrl: string, qrCodeDataUrl: string}>}
 */
async function generatePiPayment(recipient, amountPi, memo = "") {
  // Simple payment URL schema: pi:<recipient>?amount=<amount>&memo=<memo>
  const url = `pi:${recipient}?amount=${amountPi}&memo=${encodeURIComponent(memo)}`;
  const qrCodeDataUrl = await QRCode.toDataURL(url);
  return { paymentUrl: url, qrCodeDataUrl };
}

module.exports = { generatePiPayment };