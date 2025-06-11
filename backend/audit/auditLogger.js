const fs = require('fs');
const path = require('path');

const auditLogPath = path.join(__dirname, '../../logs/audit.log');

function logAudit(action, userId, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
  };
  fs.appendFile(auditLogPath, JSON.stringify(entry) + '\n', err => {
    if (err) console.error('Failed to write audit log:', err);
  });
}

module.exports = { logAudit };