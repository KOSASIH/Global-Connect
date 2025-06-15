// ai/seaMarketplaceChatbot/seaMarketplaceChatbot.js

const openai = require('../adapters/openai.adapter');

/**
 * Ultra-Advanced SEA Marketplace Customer Service Chatbot {string} [params.marketplace] - "shopee", "tokopedia", etc.
 * @param {Array} [params.context] - Optional array of past messages for context (short-term memory)
 * @returns {Promise<Object>}
 */
module.exports = async function seaMarketplaceChatbot({ message, language = "auto", marketplace, context = [] }) {
  if (!message) throw new Error('message is required');
  const audit = { requestAt: new Date().toISOString(), language, marketplace };

  // 1. Build full AI prompt
  let prompt = `
You are the most advanced, friendly, and Provide concise, clear, and respectful answers.
- Adapt your knowledge and tone for the "${marketplace || 'any'}" marketplace(s).
- Recognize common SEA e-commerce FAQ and escalate complex issues with empathy.
- If the customer is upset, gently reassure and guide them.
- If the message is not in English, auto-translate your reply to match the message language.
- Always optimize for customer satisfaction andConversation so far:\n`;
    context.slice(-5).forEach((msg, idx) => {
      prompt += `User${idx + 1}: "${msg}"\n`;
    });
  }

  // 3. Add the current user message and instruction for language
  prompt += `\nCustomer says: "${message}"\n`;

  if (language && language !== "auto") {
    prompt += += `\nIf the message is negative or urgent, reply with empathy and offer real solutions.\n`;

  // 5. AI Call and error healing
  let aiReply = "";
  try {
    aiReply = await openai.chat(prompt, { max_tokens: 256 });
    audit.status = "success";
    return {
      reply: aiReply.trim(),
      meta { max_tokens: 60 });
    } catch (e2) {
      aiSuggestion = "No AI suggestion available.";
    }
    return {
      error: error.message,
      aiSuggestion,
      meta: { unstoppable: false, audit }
    };
  }
};
