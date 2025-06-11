const fs = require('fs');
const path = require('path');

// Ensure the logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const auditLogPath = path.join(logDir, 'audit.log');

/**
 * Append an audit log entry.
 * @param {string} action - The action performed (e.g., 'createTransaction').
 * @param {string} userId - The user or system actor.
 * @param {object} details - Any additional details (object will be stringified).
 */
function logAudit(action, userId, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
  };
  fs.appendFile(auditLogPath, JSON.stringify(entry) + '\n', err => {
    if (err) {
      // Optionally, log to stderr if audit log fails (never throw)
      console.error('Failed to write audit log:', err);
    }
  });
}

module.exports = { logAudit };
