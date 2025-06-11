import React, { useEffect, useState } from 'react';

export default function AIAlertBanner() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const ws = new window.WebSocket('ws://localhost:4000'); // Adjust to your backend WebSocket URL
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ai-alert') setAlert(data.msg);
      } catch (e) {
        // Ignore non-JSON or unrelated messages
      }
    };
    return () =>10px',
      fontWeight: 'bold',
      textAlign: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999
    }}>
      AI Alert: {alert}
    </div>
  );
}
