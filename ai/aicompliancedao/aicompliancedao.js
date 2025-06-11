// This is a simplified off-chain DAO voting system for compliance rule management.
// For on-chain, integrate with smart contracts (e.g., Solidity) and Web3 libraries.

let proposals = [];
let votes = {}; // { proposalId: { userId: 'yes'/'no' } }

/**
 * Submit a new compliance proposal.
 * @param {string} userId
 * @param {string} title
 * @param {string} description
 * @returns {object}
 */
function submitProposal(userId, title, description) {
  const proposal = {
    id: proposals.length + 1,
    title,
    description,
    proposer: userId,
    status: 'open',
    yes: 0,
    no: 0,
    createdAt: new Date().toISOString()
  };
  proposals.push(proposal);
  return proposal;
}

/**
 * Vote on a proposal.
 * @param {string} userId
 * @param {number} proposalId
 * @param {'yes'|'no'} vote
 * @returns {object}
 */
function voteProposal(userId, proposalId, vote) {
  if (!votes[proposalId]) votes[proposalId] = {};
  if (votes[proposalId][userId]) return { error: 'User has already voted.' };
  if (!['yes', 'no'].includes(vote)) return { error: 'Invalid vote.' };

  votes[proposalId][userId] = vote;
  const proposal = proposals.find(p => p.id === proposalId);
  if (!proposal) return { error: 'Proposal not found.' };
  proposal[vote] += 1;
  return { proposalId, userId, vote };
}

/**
 * Get all proposals and their votes.
 * @returns {Array}
 */
function getProposals() {
  return proposals.map(p => ({
    ...p,
    votes: votes[p.id] || {}
  }));
}

module.exports = { submitProposal, voteProposal, getProposals };