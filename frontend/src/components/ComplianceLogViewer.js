import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ComplianceLogViewer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('/api/audit/logs')
      .then(res => setLogs(res.data.logs))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div>
      <h4>Compliance Audit Log</h4>
      <pre style={{ maxHeight: 300, overflowY: 'auto', background: '#eee', padding: 10 }}>
        {logs.map((log, i) => <div key={i}>{JSON.stringify(log)}</div>)}
      </pre>
    </div>
  );
}
