// scripts/setup.js
const StellarSdk = require('stellar-sdk');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();

(async () => {
    try {
        const account = await server.loadAccount(accountId);
        console.log(`Account ${accountId} is set up with balance: ${account.balances}`);
    } catch (error) {
        console.error('Setup failed:', error);
    }
})();
