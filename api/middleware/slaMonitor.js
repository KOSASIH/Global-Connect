// api/middleware/slaMonitor.js
const { recordSLA } = require('../../analytics/reporting');

module.exports = function slaMonitor(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const partnerId = req.partnerId || (req.user && req.user.partnerId) || 'unknown';
    recordSLA(partnerId, req.originalUrl, durationMs);

    // Threshold: 1s response
    if (durationMs > 1000) {
      // Hook for alerting system, e.g., Slack, email, dashboard push
      console.warn(`[SLA BREACH] Partner: ${partnerId}, Endpoint: ${req.originalUrl}, Time: ${durationMs.toFixed(2)}ms`);
    }
  });

  next();
};
