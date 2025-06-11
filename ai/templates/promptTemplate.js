module.exports = {
  complianceCopilot: (context) => `
    You are a compliance assistant. Analyze the following transaction:
    ${context.transactionDetails}
    Highlight any regulatory concerns and suggest remedies.
  `,
  summarizer: (text) => `
    Summarize the following content:
    ${text}
  `,
  chatbot: (userMessage) => `
    User says: "${userMessage}"
    Respond in a helpful, concise manner.
  `,
  // Add more templates as needed
};