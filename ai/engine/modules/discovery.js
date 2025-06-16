// ai/engine/modules/discovery.js
const axios = require('axios');

const PARTNER_DISCOVERY_API = process.env.PARTNER_DISCOVERY_API || 'https://api.partner-discovery.com/search';

async function discoverPartners({ keywords, sector, country, limit = 10 }) {
  try {
    const response = await axios.get(PARTNER_DISCOVERY_API, {
      params: { keywords, sector, country, limit }
    });
    return response.data.organizations || [];
  } catch (e) {
    console.error('Partner discovery failed:', e.message);
    return [];
  }
}

module.exports = { discoverPartners };
