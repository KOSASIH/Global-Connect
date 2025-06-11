const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generate a basic Solidity smart contract based on user requirements
async function generateSmartContract(requirements) {
  const prompt = `Write a simple Solidity smart contract for the following requirements:\n${requirements}\nInclude comments and SPDX-License-Identifier.`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.6
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

// Suggest a basic React UI for interacting with the smart contract
async function suggestDappUI(contractABI) {
  const prompt = `Given the following Solidity contract ABI, suggest a simple React component (with ethers.js or web3.js) to interact with the contract:\n${JSON.stringify(contractABI)}`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.6
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

// Provide deployment steps for the smart contract
async function deploymentSteps(network="Ethereum testnet") {
  const prompt = `List step-by-step instructions for deploying a Solidity contract to the ${network}.`;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{role: "user", content: prompt}],
      temperature: 0.3
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  return response.data.choices[0].message.content.trim();
}

module.exports = {
  generateSmartContract,
  suggestDappUI,
  deploymentSteps
};