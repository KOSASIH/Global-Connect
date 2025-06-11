/**
 * Calculates a dynamic trust score for a user/institution/device.
 * @param {Object} identity - { userId, kycStatus, amlStatus, txHistory, deviceInfo, behavior, webData }
 * @returns {{ trustScore: number, riskLevel: string, feedback: string }}
 */
function getTrustScore(identity) {
  let score = 100;
  if (identity.kycStatus !== "approved") score -= 30;
  if (identity.amlStatus !== "clear") score -= 40;
  if (identity.txHistory && identity.txHistory.suspicious > 0) score -= 20;
  if (identity.deviceInfo && identity.deviceInfo.risk === "high") score -= 10;

  let riskLevel = "low";
  if (score < 60) riskLevel = "high";
  else if (score < 80) riskLevel = "medium";

  let feedback = "Maintain positive transaction history.";
  if (riskLevel === "high") feedback = "Complete KYC/AML and use trusted devices.";
  else if (riskLevel === "medium") feedback = "Improve compliance and reduce suspicious activity.";

  return { trustScore: Math.max(score, 0), riskLevel, feedback };
}

module.exports = { getTrustScore };