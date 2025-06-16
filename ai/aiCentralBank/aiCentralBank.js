// ai/aiCentralBank/aiCentralBank.js

const { body, validationResult } = require('express-validator');
const logger = require('../../utils/logger'); // Winston or Pino logger instance
const db = require('../../utils/db'); // MongoDB or other DB utility

// Validation rules for Express route usage
module.exports.validate = [
  body('action').isString().withMessage('action is required'),
  body('proposal').optional().isObject(),
  body('vote').optional().isIn(['yes', 'no']),
  body('economicData').optional().isObject(),
  body('authToken').optional().isJWT().withMessage('authToken (JWT) is recommended for sensitive actions')
];

// Default central bank state (could be persisted)
let state = {
  interestRate: 3.14,
  mintRate: 0.01,
  burnRate: 0.005,
  collateralRatio: 2.0,
  lastUpdate: Date.now(),
  proposals: [] // [{id, params, votes: {yes:[], no:[]}, status}]
};

// Helper for audit log
async function auditLog(data) {
  try {
    await db.collection('central_bank_audit').insertOne({ ...data, ts: new Date() });
  } catch (err) {
    logger.error('CentralBank audit log failed', { error: err });
  }
}

// Helper for proposal index
function findProposal(id) {
  return state.proposals.findIndex(p => p.id === id);
}

// Autonomous AI policy update logic (can be replaced with ML model)
async function aiPolicyUpdate(economicData = {}) {
  let changed = false;
  if (economicData.inflation > 4) { state.interestRate += 0.1; changed = true; }
  if (economicData.gdpGrowth < 1) { state.mintRate -= 0.001; changed = true; }
  if (economicData.marketCrash) { state.burnRate += 0.002; changed = true; }
  if (changed) state.lastUpdate = Date.now();
  return changed;
}

// Main handler
module.exports = async function aiCentralBank(body, req, res) {
  // Validation if used as an Express handler
  if (req && res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('aiCentralBank validation failed', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }
  }

  try {
    const { action, proposal, vote, economicData, authToken } = body;
    let result = { state: { ...state } };
    let audit = { action, proposal, vote, economicData, user: req?.user?.id || 'anonymous' };

    // --- Action Routing ---
    if (action === 'propose') {
      // Propose new monetary policy: { interestRate, mintRate, burnRate, collateralRatio }
      if (!proposal || typeof proposal !== 'object')
        throw new Error('Proposal data required');
      const id = `prop_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      state.proposals.push({ id, params: proposal, votes: { yes: [], no: [] }, status: 'pending', created: Date.now() });
      result = { msg: 'Proposal submitted', proposal: { id, ...proposal } };
      audit.result = result;
    }

    else if (action === 'vote') {
      // Vote on a proposal: { id, vote }
      if (!proposal?.id || !['yes','no'].includes(vote)) throw new Error('Proposal id and vote required');
      const idx = findProposal(proposal.id);
      if (idx === -1) throw new Error('Proposal not found');
      // Only allow unique votes per user (replace this with user auth in real app)
      let user = req?.user?.id || 'anonymous';
      state.proposals[idx].votes[vote] = [...new Set([...(state.proposals[idx].votes[vote]), user])];
      // Accept/reject if >2 yes/no votes
      if (state.proposals[idx].votes['yes'].length >= 2 && state.proposals[idx].status === 'pending') {
        Object.assign(state, state.proposals[idx].params);
        state.proposals[idx].status = 'accepted';
        state.lastUpdate = Date.now();
        result = { msg: 'Proposal accepted', proposal: state.proposals[idx], state };
      } else if (state.proposals[idx].votes['no'].length >= 2 && state.proposals[idx].status === 'pending') {
        state.proposals[idx].status = 'rejected';
        result = { msg: 'Proposal rejected', proposal: state.proposals[idx] };
      } else {
        result = { msg: 'Vote recorded', proposal: state.proposals[idx] };
      }
      audit.result = result;
    }

    else if (action === 'auto') {
      // Autonomous AI-driven policy update (could be scheduled)
      const changed = await aiPolicyUpdate(economicData || {});
      result = { msg: changed ? 'Policy auto-updated' : 'No change', state };
      audit.result = result;
    }

    else if (action === 'getProposals') {
      // List all proposals
      result = { proposals: state.proposals };
      audit.result = result;
    }

    else if (action === 'getState') {
      // Get current central bank state
      result = { state };
      audit.result = result;
    }

    else {
      throw new Error('Unknown or missing action');
    }

    // Audit log (non-blocking)
    auditLog(audit);

    logger.info('aiCentralBank action', { action, user: audit.user });

    if (req && res) {
      return res.json(result);
    }
    return result;

  } catch (err) {
    logger.error('aiCentralBank error', { error: err });
    if (req && res) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    throw err;
  }
};
