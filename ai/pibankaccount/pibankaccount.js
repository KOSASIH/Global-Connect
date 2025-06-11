// In-memory accounts store (replace with DB in production)
const accounts = {};

function openAccount(userId, initialDeposit, purified) {
  if (!purified) throw new Error("Only Purified (🌟) Pi Coin can be used to open accounts.");
  if (accounts[userId]) throw new Error("Account already exists.");
  accounts[userId] = {
    userId,
    balance: initialDeposit,
    purified: true,
    openedAt: new Date().toISOString(),
    transactions: [{ type: 'deposit', amount: initialDeposit, date: new Date().toISOString() }]
  };
  return accounts[userId];
}

function closeAccount(userId) {
  if (!accounts[userId]) throw new Error("Account does not exist.");
  const closedData = accounts[userId];
  delete accounts[userId];
  return closedData;
}

function getAccount(userId) {
  return accounts[userId] || null;
}

function deposit(userId, amount, purified) {
  if (!accounts[userId]) throw new Error("Account does not exist.");
  if (!purified) throw new Error("Only Purified (🌟) Pi Coin can be deposited.");
  accounts[userId].balance += amount;
  accounts[userId].transactions.push({ type: 'deposit', amount, date: new Date().toISOString() });
  return accounts[userId];
}

function withdraw(userId, amount) {
  if (!accounts[userId]) throw new Error("Account does not exist.");
  if (accounts[userId].balance < amount) throw new Error("Insufficient funds.");
  accounts[userId].balance -= amount;
  accounts[userId].transactions.push({ type: 'withdraw', amount, date: new Date().toISOString() });
  return accounts[userId];
}

function listAccounts() {
  return Object.values(accounts);
}

module.exports = { openAccount, closeAccount, getAccount, deposit, withdraw, listAccounts };