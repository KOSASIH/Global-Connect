const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Given current features, generate ultra-advanced, never-seen-before roadmap items.
 * @param {Array} currentFeatures - List of features/modules.
 * @returns {Promise<{nextGenIdeas: Array, competitiveEdge: string}>}
 */
async function aiHyperBrain(currentFeatures) {
  const prompt = `
You are the AI HyperBrain for the most advanced tech project.
Given these current features/modules:
${JSON.stringify(currentFeatures, null, 2)}
Suggest truly next-level, never-seen-before features to keep this project unmatched.
Also describe the strategic competitive edge.
Return format:
nextGenIdeas: [list]
competitiveEdge: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return { nextGenIdeas: ["AI parsing error"], competitiveEdge: "Manual review required" };
  }
}

module.exports = { aiHyperBrain };