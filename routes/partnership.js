// routes/partnership.js
const express = require('express');
const router = express.Router();
const { autoPartnershipEngine } = require('../ai/partnership/autoPartnershipEngine');

// POST /partnership/auto
router.post('/auto', async (req, res) => {
  try {
    const input = req.body;
    // Optional: log input for audit/debug
    // console.log('Partnership auto trigger:', input);

    const result = await autoPartnershipEngine(input);

    // Optional: log result summary for monitoring
    // console.log('Partnership engine result:', {
    //   traceId: result.traceId,
    //   onboarded: result.onboarded,
    //   timestamp: result.timestamp
    // });

    res.json(result);
  } catch (e) {
    // Optional: log error for debugging
    // console.error('Partnership engine error:', e);

    res.status(500).json({ error: e.message || 'Unknown error' });
  }
});

module.exports = router;
