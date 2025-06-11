// Listens for blockchain events (e.g. PiCoin smart contract)
const Web3 = require('web3');
const contractABI = require('../../smart_contracts/PiCoin.abi.json');
const contractAddress = process.env.PICOIN_CONTRACT_ADDRESS;

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);

function listenToEvents() {
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  contract.events.allEvents()
    .on('data', event => {
      console.log('Blockchain Event:', event);
      // Here you might emit to WebSocket, store in DB, or trigger AI analysis
    })
    .on('error', err => console.error('Blockchain event error:', err));
}

module.exports = { listenToEvents };
