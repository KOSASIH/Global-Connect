const Web3 = require('web3');
const contractABI = require('../../smart_contracts/DualValueSystem.abi.json');
const contractAddress = process.env.DUAL_VALUE_CONTRACT_ADDRESS;
const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);

const contract = new web3.eth.Contract(contractABI, contractAddress);

async function getCurrentValues() {
  const internalValue = await contract.methods.internalValue().call();
  const externalValue = await contract.methods.externalValue().call();
  return { internalValue, externalValue };
}

async function createDualValueTx(sender, recipient, amount, valueType) {
  if (valueType === 'internal') {
    return contract.methods.transferInternal(recipient, amount).send({ from: sender });
  } else {
    return contract.methods.transferExternal(recipient, amount).send({ from: sender });
  }
}

module.exports = { getCurrentValues, createDualValueTx };
