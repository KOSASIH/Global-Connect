// scripts/generateReport.js
const StellarSdk = require('stellar-sdk');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();

(async () => {
    try {
        const account = await server.loadAccount(accountId);
        const balances = account.balances;
        console.log(`Report for account: ${accountId}`);
        balances.forEach(balance => {
            console.log(`Asset: ${balance.asset_code}, Balance: ${balance.balance}`);
        });
    } catch (error) {
        console.error('Report generation failed:', error);
    }
})();
