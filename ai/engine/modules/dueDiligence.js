// ai/engine/modules/dueDiligence.js
const axios = require('axios');

const DUE_DILIGENCE_API = process.env.DUE_DILIGENCE_API || 'https://api.due-diligence.com/check';

async function runDueDiligence(partner) {
  if (!partner?.name) return { passed: false, reason: 'No partner name.' };
  try {
    const response = await axios.post(DUE_DILIGENCE_API, { name: partner.name, country: partner.country });
    return response.data; // { passed: Boolean, reason: String, riskScore: Number, sanctions: [String] }
  } catch (e) {
    return { passed: false, reason: 'Due diligence API failed.' };
  }
}

module.exports = { runDueDiligence };
