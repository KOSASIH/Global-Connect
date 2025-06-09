// scripts/utils.js
const StellarSdk = require('stellar-sdk');

// Function to create a new asset
async function createAsset(server, keypair) {
    const account = await server.loadAccount(keypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset('PI', keypair.publicKey()),
        limit: '100000000000', // Set trust limit to total supply
    }))
    .setTimeout(30)
    .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    console.log(`Asset PI created successfully!`);
}

// Function to issue new PiCoins
async function issuePiCoins(server, keypair, amount) {
    const account = await server.loadAccount(keypair.publicKey());
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: keypair.publicKey(), // Send to the issuer for now
        asset: new StellarSdk.Asset('PI', keypair.publicKey()),
        amount: amount.toString(),
    }))
    .setTimeout(30)
    .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    console.log(`${amount} PI issued successfully!`);
}

module.exports = { createAsset, issuePiCoins };
