const crypto = require('crypto');
const openai =returns {Promise<Object>}
 */
module.exports = async function aiQuantumRandomness({ context }) {
  const random = crypto.randomBytes(32).toString('hex');
  let aiComment = '';
  if (context) {
    const prompt = `Explain how the following random value is suitable for ${context} from a quantum perspective: ${random}`;
    aiComment = (await openai.chat(prompt, { max_tokens: 120 })).trim();
  }
  return { randomness: random, aiComment };
};
