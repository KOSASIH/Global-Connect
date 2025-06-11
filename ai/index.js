module.exports = {
  // Core AI features
  analytics: require('./analytics/analytics'),
  chatbot: require('./chatbot/chatbot'),
  moderation: require('./moderation/moderation'),
  recommender: require('./recommendation/recommender'),
  search: require('./search/search'),
  translation: require('./translation/translation'),
  vision: require('./vision/vision'),

  // Advanced AI features
  autocomplete: require('./autocomplete/autocomplete'),
  embedding: require('./embedding/embedding'),
  faces: require('./faces/faces'),
  imagegen: require('./imagegen/imagegen'),
  intent: require('./intent/intent'),
  ocr: require('./ocr/ocr'),
  personality: require('./personality/personality'),
  spam: require('./spam/spam'),
  summarizer: require('./summarizer/summarizer'),
  voice: require('./voice/voice-to-text'),

  // E-commerce & business
  faqgen: require('./faqgen/faqgen'),
  personalshopper: require('./personalshopper/personalshopper'),
  priceoptimizer: require('./priceoptimizer/priceoptimizer'),
  reviewanalyzer: require('./reviewanalyzer/reviewanalyzer'),
  storebuilder: require('./storebuilder/storebuilder'),

  // Code and DApp builder
  bugfixer: require('./bugfixer/bugfixer'),
  codegen: require('./codegen/codegen'),
  dappsbuilder: require('./dappsbuilder/dappsbuilder'),
  docgen: require('./docgen/docgen'),
  testgen: require('./testgen/testgen'),

  // Business-specific
  churnpredictor: require('./churnpredictor/churnpredictor'),
  contractanalyzer: require('./contractanalyzer/contractanalyzer'),
  leadscorer: require('./leadscorer/leadscorer'),
  marketinsights: require('./marketinsights/marketinsights'),
  meetingnotes: require('./meetingnotes/meetingnotes'),

  // Finance, Pi Coin, and exchange
  assetbadges: require('./assetbadges/assetbadges'),
  currencyconverter: require('./currencyconverter/currencyconverter'),
  financereport: require('./financereport/financereport'),
  investadvisor: require('./investadvisor/investadvisor'),
  piaml: require('./piaml/piaml'),
  piexchange: require('./piexchange/piexchange'),
  pilisting: require('./pilisting/pilisting'),
  pipayments: require('./pipayments/pipayments'),
  pipricing: require('./pipricing/pipricing'),
  pitransparency: require('./pitransparency/pitransparency'),

  // PiBank modules
  pibankaccount: require('./pibankaccount/pibankaccount'),
  picard: require('./picard/picard'),
  piloans: require('./piloans/piloans'),
  pisavings: require('./pisavings/pisavings'),
  pistatement: require('./pistatement/pistatement'),

  // Self-healing system modules
  autorepair: require('./selfheal/autorepair'),
  healthcheck: require('./selfheal/healthcheck'),
  selfheal: require('./selfheal/selfheal'),

  // Pi Coin purity and value systems
  dualvalue: require('./dualvalue/dualvalue'),
  dualvalueai: require('./dualvalue/dualvalueai'),
  dualvaluereport: require('./dualvalue/dualvaluereport'),
  pipurity: require('./pipurity/pipurity'),

  // PiDualTx System Alignment
  pidualtxaudit: require('./pidualtxsync/pidualtxaudit'),
  pidualtxsync: require('./pidualtxsync/pidualtxsync'),
  pidualtxsyncer: require('./pidualtxsync/pidualtxsyncer'),

  // Pi Nexus Autonomous Banking Network Alignment
  pinexusalign: require('./pinexusalign/pinexusalign'),
  pinexusaudit: require('./pinexusalign/pinexusaudit'),
  pinexusfixer: require('./pinexusalign/pinexusfixer'),

  // Security, compliance, unstoppable modules
  aiActivityMonitor: require('./aiactivitymonitor/aiactivitymonitor'),
  aiAMLShield: require('./aiamlshield/aiamlshield'),
  aiComplianceAlert: require('./aicompliancealert/aicompliancealert'),
  aiDarkWebWatch: require('./aidarkwebwatch/aidarkwebwatch'),
  aiFailsafe: require('./aifailsafe/aifailsafe'),
  aiFraudShield: require('./aifraudshield/aifraudshield'),
  aiHyperbrain: require('./aihyperbrain/aihyperbrain'),
  aiPolicyAudit: require('./aipolicyaudit/aipolicyaudit'),
  aiRiskShield: require('./airiskshield/airiskshield'),
  aiTxPattern: require('./aitxpattern/aitxpattern'),
  aiUserReputation: require('./aiuserreputation/aiuserreputation'),
  aiWatchdog: require('./aiwatchdog/aiwatchdog'),

  // Advanced app, automation, workflow, and code/documentation builders
  aiApiBuilder: require('./aiapibuilder/aiapibuilder'),
  aiAppBuilder: require('./aiappbuilder/aiappbuilder'),
  aiAppTemplate: require('./aiapptemplate/aiapptemplate'),
  aiAutomationFlow: require('./aiautomationflow/aiautomationflow'),
  aiDocGen: require('./aidocgen/aidocgen'),
  aiLowCodeBuilder: require('./ailowcodebuilder/ailowcodebuilder'),
  aiSmartFormBuilder: require('./aismartformbuilder/aismartformbuilder'),
  aiWorkflowBuilder: require('./aiworkflowbuilder/aiworkflowbuilder'),

  // DAO Builder
  aiDAOBuilder: require('./aidaobuilder/aidaobuilder'),

  // Advanced Security Modules
  aiMalwareMonitor: require('./aimalwaremonitor/aimalwaremonitor'),
  aiPermissionSentry: require('./aipermissionsentry/aipermissionsentry'),
  aiPhishingGuard: require('./aiphishingguard/aiphishingguard'),
  aiThreatDetection: require('./aithreatdetection/aithreatdetection'),

  // Pi Network & Wallet Connect Alignment
  aiPiNetworkSync: require('./aipinetworksync/aipinetworksync'),
  aiTxMonitorPi: require('./aitxmonitorpi/aitxmonitorpi'),
  aiWalletConnectGuard: require('./aiwalletconnectguard/aiwalletconnectguard'),
  aiWalletUserSync: require('./aiwalletusersync/aiwalletusersync'),

  // Pi-to-Fiat & Traditional Finance Integration
  aiBankGateway: require('./aibankgateway/aibankgateway'),
  aiFinCompliance: require('./aifincompliance/aifincompliance'),
  aiPaymentRailMonitor: require('./aipaymentrailmonitor/aipaymentrailmonitor'),
  aiPiFiConverter: require('./aipificonverter/aipificonverter'),

  // Pi Purity Badge & Conversion at Fixed Value (1 Pi 🌟 = $314,159)
  aiPiPurityBadgeValidator: require('./aipipuritybadgevalidator/aipipuritybadgevalidator'),
  aiPiPurityConverter: require('./aipipurityconverter/aipipurityconverter'),

  // Global Banking and Financial System Integration & Monitoring
  aiBankKYCAML: require('./aibankkycaml/aibankkycaml'),
  aiGlobalBankConnect: require('./aiglobalbankconnect/aiglobalbankconnect'),
  aiGlobalFinMonitor: require('./aiglobalfinmonitor/aiglobalfinmonitor'),
  aiBankAPIGuard: require('./aibankapiguard/aibankapiguard'),

  // KYC & AML Dedicated Modules
  aiAMLMonitor: require('./aiamlmonitor/aiamlmonitor'),
  aiAutoKYC: require('./aiautokyc/aiautokyc'),
  aiAutoKYCAML: require('./aiautokycaml/aiautokycaml'),
  aiKYCMonitor: require('./aikycmonitor/aikycmonitor'),
  aiKYCValidator: require('./aikycvalidator/aikycvalidator'),

  // Ultra High-Tech Features
  aiComplianceCopilot: require('./aicompliancecopilot/aicompliancecopilot'),
  aiComplianceDAO: require('./aicompliancedao/aicompliancedao'),
  aiDAppBuilder: require('./aidappbuilder/aidappbuilder'),
  aiDigitalTwin: require('./aidigitaltwin/aidigitaltwin'),
  aiGlobalRegIntel: require('./aiglobalregintel/aiglobalregintel'),
  aiLiquidityRouter: require('./ailiquidityrouter/ailiquidityrouter'),
  aiMultimodalHelpdesk: require('./aimultimodalhelpdesk/aimultimodalhelpdesk'),
  aiPrivacyFederated: require('./aiprivacyfederated/aiprivacyfederated'),
  aiQuantumSecure: require('./aiquantumsecure/aiquantumsecure'),
  aiTrustEngine: require('./aitrustengine/aitrustengine'),
};
