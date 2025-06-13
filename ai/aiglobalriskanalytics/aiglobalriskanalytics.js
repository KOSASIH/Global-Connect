// ai/aiglobalriskanalytics/aiglobalriskanalytics.js

const openai = require('../adapters/openai.adapter');

/**
 * Global Risk Analytics for Markets, Supply Chain.
 */
module.exports = async function aiGlobalRiskAnalytics({ domain = "finance", input, provider = "openai" }) {
  if (!input) throw new Error('Input is required');
  const prompt = `Analyze the following ${domain} scenario for global risks (systemic, geopolitical, cyber, regulatory, etc.). Provide a risk score (0-100), key risk factors, and mitigation suggestions:\n${input}`;
  if (provider === "openai") {
    const analysis = await openai.chat(prompt, { max_tokens: 512 });
    return { domain, analysis };
  }
  throw new Error('Unsupported provider');
};
