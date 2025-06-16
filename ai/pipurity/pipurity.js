// PiPurity.js
const axios = require('axios');
const crypto = require('crypto');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const BLOCKCHAIN_API_URL = process.env.BLOCKCHAIN_API_URL || 'https://pi-blockchain.example.com/api/purity-badge';

const ALLOWED_ORIGINS = ['mining', 'peer-to-peer', 'contribution'];
const FIXED_PI_VALUE = 314159;

/**
 * Generate an audit trace ID for tracking and logging.
 */
function generateTraceId(walletAddress, txId) {
  return crypto.createHash('sha256').update(`${walletAddress || ''}:${txId || ''}:${Date.now()}`).digest('hex');
}

/**
 * Core backend validation for Pi Purity Badge eligibility.
 * @param {object} piCoinInfo - The Pi Coin info object.
 * @returns {{eligible: boolean, reason: string}}
 */
function backendPurityValidation(piCoinInfo) {
  if (
    !piCoinInfo ||
    typeof piCoinInfo !== 'object' ||
    (!piCoinInfo.origin && piCoinInfo.everOnExternalExchange === undefined)
  ) {
    return {
      eligible: false,
      reason: 'Incomplete or invalid Pi Coin info data.',
    };
  }
  if (!ALLOWED_ORIGINS.includes(piCoinInfo.origin)) {
    return {
      eligible: false,
      reason: `Origin "${piCoinInfo.origin}" is not allowed. Only mining, peer-to-peer, or contribution are eligible.`,
    };
  }
  if (piCoinInfo.everOnExternalExchange) {
    return {
      eligible: false,
      reason: 'Pi Coin has been on an external exchange and is not eligible for the Purity badge.',
    };
  }
  return {
    eligible: true,
    reason: `Pi Coin originated from ${piCoinInfo.origin} and has never been to an external exchange. Eligible for Purity badge and fixed value.`,
  };
}

/**
 * Query blockchain/external registry for authoritative badge validation.
 */
async function queryBlockchainPurityBadge({ walletAddress, txId }) {
  if (!walletAddress && !txId) return { isPurityBadge: false, badgeType: 'unknown', reason: 'No wallet or txId provided.' };
  try {
    const response = await axios.post(BLOCKCHAIN_API_URL, { walletAddress, txId });
    return response.data; // { isPurityBadge: bool, badgeType: string, reason: string }
  } catch (e) {
    return { isPurityBadge: false, badgeType: 'unknown', reason: 'Blockchain query failed.' };
  }
}

/**
 * Use AI for deeper transaction history analysis if needed.
 */
async function aiHeuristicPurityCheck({ walletAddress, txId, txHistory, meta }) {
  if (!OPENAI_API_KEY) return { isPurityBadge: false, badgeType: 'unknown', reason: 'AI key not set.' };
  // Sanitize/summarize input for prompt injection prevention
  function sanitize(str) {
    if (!str) return '';
    return String(str).replace(/[^a-z0-9 ,.:{}\[\]\-_"']/gi, '');
  }
  const prompt = `
You are a Pi Coin Purity Badge Validator AI. Criteria:
- Pi Coin must originate from mining, peer-to-peer, or contribution only.
- Must never have entered any external exchange.
Analyze this transaction history:
${sanitize(JSON.stringify(txHistory))}
Meta: ${sanitize(JSON.stringify(meta))}
Should this wallet or transaction receive the Purity badge? Output JSON:
{"isPurityBadge": true/false, "badgeType": "purity/none", "reason": "<short reason>"}
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
  try {
    const parsed = JSON.parse(txt.match(/\{[\s\S]*\}/)[0]);
    return parsed;
  } catch {
    return { isPurityBadge: false, badgeType: 'unknown', reason: 'AI response parse error.' };
  }
}

/**
 * Ultra-advanced, unstoppable Pi Coin Purity Badge Validator.
 * @param {object} req - { walletAddress, txId, piCoinInfo, txHistory?, meta? }
 * @returns {Promise<{eligible: boolean, badge: string, reason: string, traceId: string, checkedAt: number, method: string, valueUSD?: number}>}
 */
async function checkPiPurity(req) {
  const { walletAddress, txId, piCoinInfo, txHistory, meta } = req || {};
  const traceId = generateTraceId(walletAddress, txId);
  let method = 'backend';
  let eligible = false;
  let reason = '';
  let badge = '';

  // 1. Core backend validation
  if (piCoinInfo) {
    const backend = backendPurityValidation(piCoinInfo);
    eligible = backend.eligible;
    reason = backend.reason;
    badge = eligible ? '🌟' : '';
  }

  // 2. If not eligible, try blockchain/external registry
  if (!eligible && (walletAddress || txId)) {
    const chainResult = await queryBlockchainPurityBadge({ walletAddress, txId });
    if (chainResult.isPurityBadge) {
      eligible = true;
      badge = '🌟';
      reason = chainResult.reason || 'Verified by blockchain registry.';
      method = 'blockchain';
    }
  }

  // 3. If still not eligible, try AI heuristic
  if (!eligible && (txHistory || meta)) {
    const aiResult = await aiHeuristicPurityCheck({ walletAddress, txId, txHistory, meta });
    if (aiResult.isPurityBadge) {
      eligible = true;
      badge = '🌟';
      reason = aiResult.reason || 'AI-compliance validated.';
      method = 'ai-heuristic';
    }
  }

  // 4. Fallback reason
  if (!eligible && !reason) {
    reason = 'No purity badge detected for wallet or transaction.';
  }

  // Always return audit trace and method
  return {
    eligible: !!eligible,
    badge,
    reason,
    traceId,
    checkedAt: Date.now(),
    method,
    valueUSD: eligible ? FIXED_PI_VALUE : 0,
  };
}

module.exports = { checkPiPurity, backendPurityValidation };

// --------------------------------------
// Example Unit Tests (Jest-like syntax)
// --------------------------------------
if (require.main === module) {
  (async () => {
    // Test 1: Mined, never on exchange
    let res = await checkPiPurity({
      walletAddress: "pi_wallet_123",
      piCoinInfo: { origin: "mining", everOnExternalExchange: false }
    });
    console.log("Test 1 (mining, not on exchange):", res);

    // Test 2: P2P, but was on external exchange
    res = await checkPiPurity({
      walletAddress: "pi_wallet_456",
      piCoinInfo: { origin: "peer-to-peer", everOnExternalExchange: true }
    });
    console.log("Test 2 (P2P, on exchange):", res);

    // Test 3: Invalid origin
    res = await checkPiPurity({
      walletAddress: "pi_wallet_789",
      piCoinInfo: { origin: "exchange", everOnExternalExchange: false }
    });
    console.log("Test 3 (invalid origin):", res);

    // Test 4: Missing info
    res = await checkPiPurity({});
    console.log("Test 4 (missing info):", res);
  })();
    }
