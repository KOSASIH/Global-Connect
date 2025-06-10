const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Handle incoming messages
    });

    // Send notifications to the client
    const sendNotification = (data) => {
        ws.send(JSON.stringify(data));
    };
});
