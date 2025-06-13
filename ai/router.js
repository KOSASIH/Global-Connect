const airegulatoryintel = require('./airegulatoryintel/airegulatoryintel');
router.post('/airegulatoryintel', async (req, res) => {
  try {
    const result = await airegulatoryintel(req.body);
    res.json({ result });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
