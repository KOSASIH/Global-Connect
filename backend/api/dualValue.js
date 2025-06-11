const express = require('express');
const router = express.Router();
const { getCurrentValues } = require('../services/dualValueService');

router.get('/dualvalue/rates', async (req, res) => {
  const rates = await getCurrentValues();
  res.json(rates);
});

module.exports = router;
