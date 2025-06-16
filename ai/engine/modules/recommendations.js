// ai/engine/modules/recommendations.js
const { getPartnerAnalytics } = require('../../analytics/partnerAdoption');
const { Configuration, OpenAIApi } = require("openai");

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

/**
 * Generate prioritized actions for partners using AI
 * Returns: [{partnerId, recommendedAction, reason}]
 */
async function recommendActions() {
  const partners = await getPartnerAnalytics(); // Array of {partnerId, name, adoptionScore, issues, lastSeen}
  const prompt = `
You are a world-class partnerships manager AI. Given this partner data, recommend the next best action for each partner, with a one-line reason:

${JSON.stringify(partners)}

Return as JSON: [{partnerId, recommendedAction, reason}]
  `.trim();

  const res = await openai.createChatCompletion({
    model: "gpt-4o",
    messages: [{role: "user", content: prompt}],
    temperature: 0.2,
    max_tokens: 512
  });

  // Parse JSON from AI's response
  let actions = [];
  try {
    actions = JSON.parse(res.data.choices[0].message.content);
  } catch {
    actions = [];
  }
  return actions;
}

module.exports = { recommendActions };
