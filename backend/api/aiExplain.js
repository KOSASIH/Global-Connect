// Exposes transparent explanations for AI decisions
const express = require('express');
const router = express.Router();
const { explainDecision } = require('../../ai/helpers/explainability');

router.post('/ai/explain', async (req, res) => {
  try {
    const { model, input, output } = req.body;
    const explanation = await explainDecision(model, input, output);
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: 'Unable to explain AI decision.' });
  }
});

module.exports = router;