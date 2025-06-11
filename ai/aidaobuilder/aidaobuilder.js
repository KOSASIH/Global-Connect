const axios = require('axios');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Generates DAO smart contract code, governance logic, and deployment instructions based on requirements.
 * @param {Object} daoSpec - { name, tokenSymbol, votingSystem, proposalTypes, blockchain, features }
 * @returns {Promise<{contractCode: string, governanceLogic: string, deploymentGuide: string, recommendations: string}>}
 */
async function aiDAOBuilder(daoSpec) {
  const prompt = `
You are an advanced AI DAOBuilder. Given the following DAO specification, generate:
- Smart contract code (Solidity if Ethereum-compatible, or appropriate for the specified blockchain)
- Governance logic explanation (voting, proposal, execution)
- Step-by-step deployment guide
- Recommendations for best practices and security

DAO Spec:
${JSON.stringify(daoSpec, null, 2)}

Return as:
contractCode: <string>
governanceLogic: <string>
deploymentGuide: <string>
recommendations: <string>
  `;
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.18,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );
  try {
    return JSON.parse(response.data.choices[0].message.content);
  } catch {
    return {
      contractCode: "Parsing error. Please check your DAO specification.",
      governanceLogic: "",
      deploymentGuide: "",
      recommendations: ""
    };
  }
}

module.exports = { aiDAOBuilder };