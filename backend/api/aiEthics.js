const express = require('express');
const router = express.Router();

router.get('/ai/ethics', (req, res) => {
  res.json({
    fairness: "Models are regularly tested for bias.",
    transparency: "AI decisions are explainable and can be reviewed.",
    privacy: "No personal data is used for training without explicit consent.",
    review: "Periodic audits ensure ethical standards are met."
  });
});

module.exports = router;
