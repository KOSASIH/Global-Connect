const express = require('express');
const router = express.Router();
const { checkContractSync } = require('../utils/contractSyncChecker');

router.get('/contract/health', (req, res) => {
  const result = checkContractSync(
    './smart_contracts/DualValueSystem.abi.json',
    '../PiDualTx/build/DualValueSystem.abi.json',
    process.env.DUAL_VALUE_CONTRACT_ADDRESS,
    process.env.PIDUALTX_CONTRACT_ADDRESS
  );
  res.json(result);
});

module.exports = router;
