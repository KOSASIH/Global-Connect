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
  marketinsights: require('./marketinsights/marketinsights'),

  // Finance and Pi Coin AI features
  currencyconverter: require('./currencyconverter/currencyconverter'),
  financereport: require('./financereport/financereport'),
  pipayments: require('./pipayments/pipayments'),
  assetbadges: require('./assetbadges/assetbadges'),
  investadvisor: require('./investadvisor/investadvisor'),

  // Ultra high-tech Pi Coin exchange modules (Purify badge only)
  piexchange: require('./piexchange/piexchange'),
  piaml: require('./piaml/piaml'),
  pipricing: require('./pipricing/pipricing'),
  pitransparency: require('./pitransparency/pitransparency'),
  pilisting: require('./pilisting/pilisting'),

  // PiBank modules
  pibankaccount: require('./pibankaccount/pibankaccount'),
  piloans: require('./piloans/piloans'),
  pisavings: require('./pisavings/pisavings'),
  pistatement: require('./pistatement/pistatement'),
  picard: require('./picard/picard'),

  // Self-healing system modules for Global Connect
  selfheal: require('./selfheal/selfheal'),
  healthcheck: require('./selfheal/healthcheck'),
  autorepair: require('./selfheal/autorepair'),

  // Purity check for Pi Coin (ENGLISH)
  pipurity: require('./pipurity/pipurity'),

  // Dual Value System modules
  dualvalue: require('./dualvalue/dualvalue'),
  dualvaluereport: require('./dualvalue/dualvaluereport'),
  dualvalueai: require('./dualvalue/dualvalueai')
};
