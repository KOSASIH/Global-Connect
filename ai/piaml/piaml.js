const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Evaluate user and transaction for AML/KYC compliance.
 * Only compliant, verified users/assets can transact or receive Purify badge.
 * @param {object} userProfile - e.g. { name, idDoc, country, wallet, history }
 * @param {object} transaction - e.g. { amount, asset, from, to }
 * @returns {Promise<{compliant:boolean, reason:string}>}
 */
async function checkAMLKYC(userProfile, transaction) {
  const prompt = `
  Evaluate the following user and transaction for Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance, based on global best practices. 
  Respond with compliant: true/false and a brief reason. 
  User: ${JSON.stringify(userProfile, null, 2)}
  Transaction: ${JSON.stringify(transaction, null, 2)}
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.2
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  const txt = response.data.choices[0].message.content;
  return parseComplianceResponse(txt);
}

function parseComplianceResponse(txt) {
  const m = txt.match(/compliant\s*[:=]\s*(true|false)[,;]?\s*reason\s*[:=]\s*(.*)/i);
  if (m) return { compliant: m[1].toLowerCase() === "true", reason: m[2] };
  return { compliant: txt.toLowerCase().includes("true"), reason: txt };
}

module.exports = { checkAMLKYC };