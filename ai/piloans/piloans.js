const loans = [];

function requestLoan(userId, amount, purified, score) {
  if (!purified) throw new Error("Only Purified (🌟) Pi Coin can be lent.");
  if (score < 7) throw new Error("User credit score too low for loan.");
  const loan = {
    loanId: "LN" + (loans.length + 1),
    userId,
    amount,
    status: "active",
    issuedAt: new Date().toISOString(),
    repaid: 0,
    purified
  };
  loans.push(loan);
  return loan;
}

function repayLoan(loanId, amount) {
  const loan = loans.find(l => l.loanId === loanId);
  if (!loan) throw new Error("Loan not found.");
  if (loan.status !== "active") throw new Error("Loan is not active.");
  loan.repaid += amount;
  if (loan.repaid >= loan.amount) loan.status = "repaid";
  return loan;
}

function getLoans(userId) {
  return loans.filter(l => l.userId === userId);
}

module.exports = { requestLoan, repayLoan, getLoans };