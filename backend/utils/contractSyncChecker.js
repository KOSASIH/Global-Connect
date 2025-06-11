const fs = require('fs');
const path = require('path');

function checkContractSync(localAbiPath, remoteAbiPath, localAddress, remoteAddress) {
  const localAbi = fs.readFileSync(localAbiPath, 'utf-8');
  const remoteAbi = fs.readFileSync(remoteAbiPath, 'utf-8');
  const abiMatch = localAbi === remoteAbi;
  const addressMatch = localAddress === remoteAddress;
  return { abiMatch, addressMatch };
}

module.exports = { checkContractSync };
