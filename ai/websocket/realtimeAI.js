// Sends real-time AI alerts (e.g. fraud, compliance) over WebSocket
const WebSocket = require('ws');
let wss;

function setup(server) {
  wss = new WebSocket.Server({ server });
  wss.on('connection', ws => {
    ws.send(JSON.stringify({ type: 'welcome', msg: 'AI Event Stream Connected' }));
  });
}

function broadcastAIEvent(event) {
  if (!wss) return;
  const data = JSON.stringify(event);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

module.exports = { setup, broadcastAIEvent };