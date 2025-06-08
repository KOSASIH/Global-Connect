// migrations/2_deploy_contracts.js
const StellarSdk = require('stellar-sdk');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();
const ASSET_CODE = 'PI';
const ASSET_ISSUER = accountId; // Issuer of the asset

async function createAsset() {
    const account = await server.loadAccount(accountId);
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.changeTrust({
        asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
        limit: '1000000', // Set trust limit
    }))
    .setTimeout(30)
    .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    console.log(`Asset ${ASSET_CODE} created successfully!`);
}

async function deployContracts() {
    console.log("Deploying contracts...");
    await createAsset();
    console.log("Contracts deployed successfully.");
}

deployContracts()
    .then(() => console.log("Deployment complete."))
    .catch(error => console.error("Error during deployment:", error));
