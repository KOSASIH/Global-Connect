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

  // E-commerce & business
  storebuilder: require('./storebuilder/storebuilder'),
  reviewanalyzer: require('./reviewanalyzer/reviewanalyzer'),
  faqgen: require('./faqgen/faqgen'),
  priceoptimizer: require('./priceoptimizer/priceoptimizer'),
  personalshopper: require('./personalshopper/personalshopper'),

  // Code and DApp builder
  dappsbuilder: require('./dappsbuilder/dappsbuilder'),
  codegen: require('./codegen/codegen'),
  testgen: require('./testgen/testgen'),
  bugfixer: require('./bugfixer/bugfixer'),
  docgen: require('./docgen/docgen'),

  // Business-specific
  leadscorer: require('./leadscorer/leadscorer'),
  meetingnotes: require('./meetingnotes/meetingnotes'),
  churnpredictor: require('./churnpredictor/churnpredictor'),
  contractanalyzer: require('./contractanalyzer/contractanalyzer'),
  marketinsights: require('./marketinsights/marketinsights'),

  // Finance, Pi Coin, and exchange
  currencyconverter: require('./currencyconverter/currencyconverter'),
  financereport: require('./financereport/financereport'),
  pipayments: require('./pipayments/pipayments'),
  assetbadges: require('./assetbadges/assetbadges'),
  investadvisor: require('./investadvisor/investadvisor'),
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

  // Self-healing system modules
  selfheal: require('./selfheal/selfheal'),
  healthcheck: require('./selfheal/healthcheck'),
  autorepair: require('./selfheal/autorepair'),

  // Pi Coin purity and value systems
  pipurity: require('./pipurity/pipurity'),
  dualvalue: require('./dualvalue/dualvalue'),
  dualvaluereport: require('./'),

  // PiDualTx System Alignment
  pidualtxsync: require('./pidualtxsync/pidualtxsync'),
  pidualtxaudit: require('./pidualtxsync/pidualtxaudit'),
  pidualtxsyncer: require('./pidualtxsync/pidualtxsyncer'),

  // Pi Nexus Autonomous Banking Network Alignment
  pinexusalign: require('./pinexusalign/pinexusalign'),
  pinexusaudit: require('./pinexusalign/pinexusaudit'),
  pinexusfixer: require('./pinexusalign/pinexusfixer'),

  // Ultra high-tech security, compliance, and unstoppable modules
  aiwatchdog: require('./aiwatchdog/aiwatchdog'),
  airiskshield: require('./airiskshield/airiskshield'),
  aihyperbrain: require('./aihyperbrain/aihyperbrain'),
  aifailsafe: require('./aifailsafe/aifailsafe'),
  aiFraudShield: require('./aifraudshield/aifraudshield'),
  aiPolicyAudit: require('./aipolicyaudit/aipolicyaudit'),
  aiActivityMonitor: require('./aiactivitymonitor/aiactivitymonitor'),
  aiAMLShield: require('./aiamlshield/aiamlshield'),
  aiUserReputation: require('./aiuserreputation/aiuserreputation'),
  aiTxPattern: require('./aitxpattern/aitxpattern'),
  aiComplianceAlert: require('./aicompliancealert/aicompliancealert'),
  aiDarkWebWatch: require('./aidarkwebwatch/aidarkwebwatch'),

  // Advanced app and automation builders
  aiAppBuilder: require('./aiappbuilder/aiappbuilder'),
  aiLowCodeBuilder: require('./ailowcodebuilder/ailowcodebuilder'),
  aiAutomationFlow: require('./aiautomationflow/aiautomationflow'),
  aiAppTemplate: require('./aiapptemplate/aiapptemplate'),
  aiSmartFormBuilder: require('./aismartformbuilder/aismartformbuilder'),
  aiApiBuilder: require('./aiapibuilder/aiapibuilder'),
  aiDocGen: require('./aidocgen/aidocgen'),
  aiWorkflowBuilder: require('./aiworkflowbuilder/aiworkflowbuilder'),
};
