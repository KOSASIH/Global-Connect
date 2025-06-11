const axios = require('axios');

/**
 * Aggregates global regulatory news, laws, and alerts (demo: fetches from NewsAPI).
 * In production, use legal/compliance feeds or vendor APIs.
 * @returns {Promise<Array>} Array of latest regulatory items
 */
async function getGlobalRegIntel() {
  // Example: fetch regulatory news (replace with a real legal API in prod)
  const url = `https://newsapi.org/v2/everything?q=regulation+finance&sortBy=publishedAt&apiKey=YOUR_NEWSAPI_KEY`;
  try {
    const { data } = await axios.get(url);
    return data.articles.map(a => ({
      title: a.title,
      description: a.description,
      url: a.url,
      publishedAt: a.publishedAt
    }));
  } catch (e) {
    return [{ title: "Error", description: e.message, url: "", publishedAt: "" }];
  }
}

module.exports = { getGlobalRegIntel };