// scripts/deploy.js
const StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');
const { createAsset, issuePiCoins } = require('./utils'); // Import utility functions

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();

(async () => {
    try {
        await createAsset(server, keypair); // Create the asset
        await issuePiCoins(server, keypair, 100); // Issue 100 PiCoins
        console.log('Deployment completed successfully!');
    } catch (error) {
        console.error('Deployment failed:', error);
    }
})();
