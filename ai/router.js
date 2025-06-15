// ai/router.js

const express = require('express');
const router = express.Router();

// Regulatory Intelligence
const airegulatoryintel = require('./airegulatoryintel/airegulatoryintel');
router.post('/airegulatoryintel', async (req, res) => {
  try {
    const result = await airegulatoryintel(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Quantum Entanglement Wallet Audit
const aiQuantumEntanglementAudit = require('./aiquantumentanglementaudit/aiquantumentanglementaudit');
router.post('/aiquantumentanglementaudit', async (req, res) => {
  try {
    const result = await aiQuantumEntanglementAudit(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Quantum Key Manager
const aiQuantumKeyManager = require('./aiquantumkeymanager/aiquantumkeymanager');
router.post('/aiquantumkeymanager', async (req, res) => {
  try {
    const result = await aiQuantumKeyManager(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Quantum Consensus Analyzer
const aiQuantumConsensus = require('./aiquantumconsensus/aiquantumconsensus');
router.post('/aiquantumconsensus', async (req, res) => {
  try {
    const result = await aiQuantumConsensus(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// SEA Marketplace Integrations
const seaMarketplaceSync = require('./seaMarketplaceSync/seaMarketplaceSync');
router.post('/seaMarketplaceSync', async (req, res) => {
  try {
    const result = await seaMarketplaceSync(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const seaMarketplaceInsights = require('./seaMarketplaceInsights/seaMarketplaceInsights');
router.post('/seaMarketplaceInsights', async (req, res) => {
  try {
    const result = await seaMarketplaceInsights(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const seaMarketplaceChatbot = require('./seaMarketplaceChatbot/seaMarketplaceChatbot');
router.post('/seaMarketplaceChatbot', async (req, res) => {
  try {
    const result = await seaMarketplaceChatbot(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const seaMarketplacePriceOptimizer = require('./seaMarketplacePriceOptimizer/seaMarketplacePriceOptimizer');
router.post('/seaMarketplacePriceOptimizer', async (req, res) => {
  try {
    const result = await seaMarketplacePriceOptimizer(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Example for adding more AI modules in the same style
// const someModule = require('./somemodule/somemodule');
// router.post('/somemodule', async (req, res) => {
//   try {
//     const result = await someModule(req.body);
//     res.json({ result });
//   } catch (e) {
//     res.status(400).json({ error: e.message });
//   }
// });

module.exports = router;
