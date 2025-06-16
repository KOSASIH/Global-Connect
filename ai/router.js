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
    if (file.startsWith('_')) return; // skip hidden/system files
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      // Recursively register routes for subdirectories
      registerModuleRoutes(fullPath, baseRoute + '/' + file);
    } else if (file.endsWith('.js')) {
      // Build route path (normalize for Windows/Unix)
      const routePath = (baseRoute + '/' + file.replace(/\.js$/, '')).replace(/\\/g, '/');
      // Prevent double-registration
      if (router.stack.some(r => r.route && r.route.path === routePath && r.route.methods.post)) return;
      // Lazy-load for hot-reload environments
      router.post(routePath, async (req, res) => {
        try {
          // Dynamic require for latest code (avoids cache issues)
          const mod = require(fullPath);
          // If module expects (body, req, res), call with those
          if (typeof mod === 'function' && mod.length >= 2) {
            await mod(req.body, req, res);
          } else if (typeof mod === 'function') {
            const result = await mod(req.body);
            res.json({ result });
          } else {
            throw new Error('Module export is not a function');
          }
        } catch (e) {
          console.error(`[AI ROUTER][${routePath}] Error:`, e);
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
