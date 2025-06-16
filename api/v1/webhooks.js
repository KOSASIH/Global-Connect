// api/v1/webhooks.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { saveWebhook, getWebhooksForEvent } = require('../../db/webhooks');

/** Register a webhook for a partner event */
router.post('/register', async (req, res) => {
  const { partnerId, url, events } = req.body;
  if (!partnerId || !url || !Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  await saveWebhook({ partnerId, url, events });
  res.json({ success: true });
});

/** Deliver a webhook event to all relevant URLs (with retry/backup) */
async function deliverWebhook(eventType, payload) {
  const webhooks = await getWebhooksForEvent(eventType);
  for (const hook of webhooks) {
    try {
      await axios.post(hook.url, { event: eventType, payload }, { timeout: 5000 });
    } catch (e) {
      // TODO: Queue for retry, log failure
      console.error(`Webhook delivery failed for ${hook.url}: ${e.message}`);
    }
  }
}

module.exports = { router, deliverWebhook };
