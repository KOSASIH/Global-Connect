const express = require('express');
const router = express.Router();
const { setActiveModel } = require('../../ai/helpers/modelHotSwap');

router.post('/ai/switch-model', (req, res) => {
  const { model } = req.body;
  if (setActiveModel(model)) {
    return res.json({ success: true, active: model });
  }
  res.status(400).json({ success: false, error: 'Invalid model' });
});

module.exports = router;
