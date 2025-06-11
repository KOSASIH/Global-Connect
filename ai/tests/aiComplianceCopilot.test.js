const complianceCopilot = require('../aicompliancecopilot/aicompliancecopilot');

describe('Compliance Copilot AI', () => {
  it('flags suspicious transactions', () => {
    const result = complianceCopilot.analyze({
      transactionDetails: 'Transfer of $10,000 to offshore account'
    });
    expect(result.flags).toContain('offshore');
  });
});