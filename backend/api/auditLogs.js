const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// You can change this path as needed to match your deployment/log structure
const logFile = path.join(__dirname, '../../logs/audit.log');

router.get('/audit/logs', (req, res) => {
  // Check if log file exists
  if (!fs.existsSync(logFile)) {
    return res.json({ logs: [] });
  }

  try {
    // Read the file, but limit to last 1000 lines for performance
    const fileContent = fs.readFileSync(logFile, 'utf-8');
    const lines = fileContent.trim().split('\n');
    const lastLines = lines.slice(-1000);

    // Parse lines to JSON
    const logs = lastLines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { parseError: true, line };
      }
    });

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read audit log.' });
  }
});

module.exports = router;
