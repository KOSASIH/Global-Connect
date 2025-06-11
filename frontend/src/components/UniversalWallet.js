import React, { useState } from 'react';

export default function UniversalWallet() {
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [authResult, setAuthResult] = useState(null);

  // Check if code is running in Pi Browser and Pi SDK is available
  const isPiBrowser = () => {
    return typeof window !== 'undefined' &&
           window.Pi &&
           typeof window.Pi.openPayment === 'function';
  };

  const connectWallet = async () => {
    setError('');
    if (!isPiBrowser()) {
      setError('Please open this dApp in the Pi Browser at wallet.pinet.com.');
      return;
    }
    try {
      // Pi.authenticate takes a list of scopes and a callback
      window.Pi.authenticate(
        ['username', 'payments'],
        (result) => {
          if (result && result.user && result.user.uid) {
            setAddress(result.user.uid); // Pi Wallet Address (public key)
            setUsername(result.user.username);
            setAuthResult(result);
          } else {
            setError('Failed to authenticate with Pi Wallet.');
          }
        },
        (err) => {
          setError(err ? err.message : 'Authentication error');
        }
      );
    } catch (e) {
      setError(e.message || 'Error connecting to Pi Wallet');
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    setUsername('');
    setAuthResult(null);
    setError('');
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: 8,
      padding: 20,
      maxWidth: 400,
      margin: '30px auto',
      background: '#fafbfc'
    }}>
      <h3>Pi Network Wallet</h3>
      {address ? (
        <div>
          <p><strong>Pi Username:</strong> {username}</p>
          <p><strong>Wallet Address <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect to Pi Wallet</button>
      )}
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
      {!isPiBrowser() && (
        <div style={{ color: '#555', marginTop: 10 }}>
          Please open this app in the <a href="https://wallet.pinet.com" target="_blank" rel="noopener noreferrer">Pi Browser</a>.
        </div>
      )}
    </div>
  );
}
