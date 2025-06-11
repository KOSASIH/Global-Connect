module.exports = {
  chatbot: require('./chatbot/chatbot'),
  recommender: require('./recommendation/recommender'),
  moderation: require('./moderation/moderation'),
  analytics: require('./analytics/analytics'),
  translation: require('./translation/translation'),
  search: require('./search/search'),
  vision: require('./vision/vision'),

  // Additional AI features:
  summarizer: require('./summarizer/summarizer'),
  embedding: require('./embedding/embedding'),
  ocr: require('./ocr/ocr'),
  voice: require('./voice/voice-to-text'),
  autocomplete: require('./autocomplete/autocomplete'),
  imagegen: require('./imagegen/imagegen'),
  faces: require('./faces/faces'),
  spam: require('./spam/spam'),
  personality: require('./personality/personality'),
  intent: require('./intent/intent'),
};