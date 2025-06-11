const https = require('https');
const fs = require('fs');

const remoteAbiUrl = 'https://raw.githubusercontent.com/KOSASIH/PiDualTx/main/build/DualValueSystem.abi.json';
const localPath = './smart_contracts/DualValueSystem.abi.json';

https.get(remoteAbiUrl, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync(localPath, data, 'utf-8');
    console.log('ABI updated from PiDualTx.');
  });
});
