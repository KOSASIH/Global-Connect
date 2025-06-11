module.exports = {
  model: process.env.AI_MODEL || 'gpt-4',
  temperature: 0.3,
  maxTokens: 2048,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  complianceThreshold: 0.8,
  // Add more as needed
};