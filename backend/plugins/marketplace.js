const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const EXT_DIR = path.join(__dirname, '../../extensions');

router.get('/list', (req, res) => {
  const plugins = fs.readdirSync(EXT_DIR)
    .filter(f => fs.statSync(path.join(EXT_DIR, f)).isDirectory())
    .map(f => ({
      name: f,
      main: fs.existsSync(path.join(EXT_DIR, f, 'index.js'))
    }));
  res.json(plugins);
});

// Dynamic loading example
router.post('/enable', (req, res) => {
  const { plugin } = req.body;
  try {
    require(path.join(EXT_DIR, plugin, 'index.js'))(global.app); // Pass your app context
    res.json({ status: 'enabled', plugin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
