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

// Quantum Security
const aiQuantumSecure = require('./aiquantumsecure/aiquantumsecure async (req, res) => {
  try {
    const result = await aiDAOBuilder(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Global Risk Analytics
const aiGlobalRiskAnalytics = require('./aiglobalriskanalytics/aiglobalriskanalytics');
router.post('/aiglobalriskanalytics', async (req, res) => {
  try {
    const result = await aiGlobalRiskAnalytics(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Example for adding more AI modules in the same style ---
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
