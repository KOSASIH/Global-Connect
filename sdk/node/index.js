// sdk/node/index.js
const axios = require('axios');

class GlobalConnectSDK {
  /**
   * @param {string} apiKey - Your partner API key.
   * @param {string} [apiBase] - Optional: override API base URL.
   */
  constructor {
    const res = await axios.post(`${this.apiBase}/webhooks/register`, {
      events: eventTypes,
      url
    }, { headers: this.headers });
    return res.data;
  }

  // Fetch partner analytics
  async getAnalytics() {
    const res = await axios.get(`${this.apiBase}/partners/analytics`, { headers: this.headers });
    return res.data;
  }
}

module.exports = GlobalConnectSDK;
