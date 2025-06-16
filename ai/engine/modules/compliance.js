// ai/engine/modules/compliance.js
const axios = require('axios');
const { logComplianceEvent } = require('../../analytics/reporting');
const AML_API = process.env.AML_API_URL;
const KYC_API = process.env.KYC_API_URL;

/**
 * Runs compliance checks (KYC & AML) for a partner.
 * Returns: { status: 'clear'|'flagged'|'error', details }
 */
async function runComplianceChecks(partner) {
  if (!partner.legalName || !partner.country) {
    return { status: 'error', details: { reason: 'Missing legalName or country' } };
  }

  const result = { aml: null, kyc: null };

  try {
    // AML Check
    if (AML_API) {
      const amlRes = await axios.post(`${AML_API}/check`, {
        name: partner.legalName,
        country: partner.country
      });
      result.aml = amlRes.data;
    }

    // KYC Check
    if (KYC_API) {
      const kycRes = await axios.post(`${KYC_API}/verify`, {
        name: partner.legalName,
        id_number: partner.idNumber,
        country: partner.country
      });
      result.kyc = kycRes.data;
    }

    // Decision logic
    if (result.aml?.status === 'flagged' || result.kyc?.status === 'flagged') {
      logComplianceEvent('flagged', partner, result);
      return { status: 'flagged', details: result };
    } else if (result.aml?.status === 'clear' && result.kyc?.status === 'clear') {
      logComplianceEvent('clear', partner, result);
      return { status: 'clear', details: result };
    } else {
      logComplianceEvent('error', partner, result);
      return { status: 'error', details: result };
    }
  } catch (e) {
    logComplianceEvent('error', partner, { error: e.message });
    return { status: 'error', details: { reason: e.message } };
  }
}

/**
 * Batch compliance checks for many partners, async.
 * Returns array of results.
 */
async function runBatchCompliance(partners) {
  return Promise.all(partners.map(runComplianceChecks));
}

module.exports = { runComplianceChecks, runBatchCompliance };
