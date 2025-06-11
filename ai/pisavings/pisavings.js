const savingsAccounts = [];

function createSavings(userId, amount, purified, termMonths) {
  if (!purified) throw new Error("Only Purified (🌟) Pi Coin allowed.");
  const interestRate = 0.12; // 12% annual
  const account = {
    savingsId: "SV" + (savingsAccounts.length + 1),
    userId,
    amount,
    termMonths,
    interestRate,
    createdAt: new Date().toISOString(),
    matured: false
  };
  savingsAccounts.push(account);
  return account;
}

function calculateMaturity(savingsId) {
  const acc = savingsAccounts.find(a => a.savingsId === savingsId);
  if (!acc) throw new Error("Savings account not found.");
  const years = acc.termMonths / 12;
  const maturityAmount = acc.amount * Math.pow((1 + acc.interestRate), years);
  return { ...acc, maturityAmount };
}

function getUserSavings(userId) {
  return savingsAccounts.filter(a => a.userId === userId);
}

module.exports = { createSavings, calculateMaturity, getUserSavings };