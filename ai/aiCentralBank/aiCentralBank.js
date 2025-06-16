/**
 * Autonomous AI Central Bank for Pi Coin
 * - Sets interest, mint/burn, and collateral policies
 * - Community governance (inputs can override)
 */

let state = {
  interestRate: 3.14,
  mintRate: 0.01,
  burnRate: 0.005,
  collateralRatio: 2.0,
  lastUpdate: Date.now()
};

module.exports = async function(body) {
  // Inputs: action, proposal, vote, economicData
  const { action, proposal, vote, economicData = {} } = body;
  if (action === 'propose') {
    // Accept a new proposal (ex: {interestRate: 2.5})
    state.proposal = { ...proposal, status: 'pending', votes: [] };
    return { msg: 'Proposal submitted', proposal: state.proposal };
  }
  if (action === 'vote') {
    if (state.proposal) {
      state.proposal.votes.push(vote);
      // Demo: accept if >2 votes for
      if (state.proposal.votes.filter(x => x === 'yes').length >= 2) {
        Object.assign(state, state.proposal);
        delete state.proposal;
        state.lastUpdate = Date.now();
        return { msg: 'Proposal accepted', state };
      }
      return { msg: 'Vote recorded', proposal: state.proposal };
    }
    return { error: 'No proposal to vote on' };
  }
  // AI-driven adjustment
  if (action === 'auto') {
    // Example: if inflation up, increase interest
    if (economicData.inflation > 4) state.interestRate += 0.1;
    if (economicData.gdpGrowth < 1) state.mintRate -= 0.001;
    state.lastUpdate = Date.now();
    return { msg: 'Policy auto-updated', state };
  }
  return { state };
};
