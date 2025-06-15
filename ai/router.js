// ai/router.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * Dynamically auto-register all AI modules in the ai/ folder and subfolders as POST endpoints.
 * Example: ai/airegulatoryintel/airegulatoryintel.js => POST /airegulatoryintel/airegulatoryintel
 * Example: ai/quantum/entanglementAudit.js => POST /quantum/entanglementAudit
 */
function registerModuleRoutes(dir, baseRoute = '') {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively register routes for subdirectories
      registerModuleRoutes(fullPath, baseRoute + '/' + file);
    } else if (file.endsWith('.js') && !file.startsWith('_')) {
      const mod = require(fullPath);
      const routePath = (baseRoute + '/' + file.replace('.js', '')).replace(/\\/g, '/');
      router.post(routePath, async (req, res) => {
        try {
          // Allow modules to optionally handle the full (req, res) signature for advanced use
          if (mod.length >= 2) {
            // Module expects (body, req, res)
            await mod(req.body, req, res);
          } else {
            const result = await mod(req.body);
            res.json({ result });
          }
        } catch (e) {
          console.error(`[${routePath}] Error:`, e);
          res.status(400).json({ error: e.message || 'Unknown error' });
        }
      });
    }
  });
}

// Register all modules in the ai/ directory (relative to this file)
registerModuleRoutes(__dirname);

// Health-check endpoint
router.get('/health', (req, res) => res.json({ status: 'ok', ts: Date.now() }));

// Example: add custom routes as needed
// const customModule = require('./customModule');
// router.post('/customEndpoint', async (req, res) => { ... });

module.exports = router;
