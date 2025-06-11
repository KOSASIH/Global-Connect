module.exports = {
  // Core AI features
  chatbot: require('./chatbot/chatbot'),
  recommender: require('./recommendation/recommender'),
  moderation: require('./moderation/moderation'),
  analytics: require('./analytics/analytics'),
  translation: require('./translation/translation'),
  search: require('./search/search'),
  vision: require('./vision/vision'),

  // Advanced AI features
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

  // E-commerce and business AI features
  storebuilder: require('./storebuilder/storebuilder'),
  reviewanalyzer: require('./reviewanalyzer/reviewanalyzer'),
  faqgen: require('./faqgen/faqgen'),
  priceoptimizer: require('./priceoptimizer/priceoptimizer'),
  personalshopper: require('./personalshopper/personalshopper'),

  // Code and DApp builder AI features
  dappsbuilder: require('./dappsbuilder/dappsbuilder'),
  codegen: require('./codegen/codegen'),
  testgen: require('./testgen/testgen'),
  bugfixer: require('./bugfixer/bugfixer'),
  docgen: require('./docgen/docgen'),

  // Business-specific AI features
  leadscorer: require('./leadscorer/leadscorer'),
  meetingnotes: require('./meetingnotes/meetingnotes'),
  churnpredictor: require('./churnpredictor/churnpredictor'),
  contractanalyzer: require('./contractanalyzer/contractanalyzer'),
  marketinsights: require('./marketinsights/marketinsights')
};
