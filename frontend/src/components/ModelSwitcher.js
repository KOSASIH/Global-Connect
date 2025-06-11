import React, { useState } from 'react';
import axios from 'axios';

export default function ModelSwitcher() {
  const [active, setActive] = useState('gpt4');

  const switchModel = async (model) => {
    await axios.post('/api/ai/switch-model', { model });
    setActive(model);
  };

  return (
    <div>
      <h4>AI Model Switcher</h4>
      <button onClick={() => switchModel('gpt4')} disabled={active === 'gpt4'}>GPT-4</button>
      <button onClick={() => switchModel('quantumSecure')} disabled={active === 'quantumSecure'}>Quantum Secure</button>
    </div>
  );
}
