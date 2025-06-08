// Import Stellar SDK
const StellarSdk = require('stellar-sdk');
const fetch = require('node-fetch');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();

// Constants
const ASSET_NAME = 'PiCoin';
const ASSET_CODE = 'PI';
const ASSET_ISSUER = accountId; // Issuer of the asset
const STABLE_VALUE = 314159; // 1 Pi = $314,159

// Function to create a new asset
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

// Function to issue new PiCoins
async function issuePiCoins(amount) {
    const account = await server.loadAccount(ASSET_ISSUER);
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: accountId, // Send to the issuer for now
        asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
        amount: amount.toString(),
    }))
    .setTimeout(30)
    .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    console.log(`${amount} ${ASSET_CODE} issued successfully!`);
}

// Function to transfer PiCoins
async function transferPiCoins(destination, amount) {
    const account = await server.loadAccount(accountId);
    const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
    })
    .addOperation(StellarSdk.Operation.payment({
        destination: destination,
        asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
        amount: amount.toString(),
    }))
    .setTimeout(30)
    .build();

    transaction.sign(keypair);
    await server.submitTransaction(transaction);
    console.log(`${amount} ${ASSET_CODE} transferred to ${destination}!`);
}

// Function to get the balance of an account
async function getBalance(accountId) {
    const account = await server.loadAccount(accountId);
    const balances = account.balances;
    const piCoinBalance = balances.find(b => b.asset_code === ASSET_CODE);
    return piCoinBalance ? piCoinBalance.balance : 0;
}

// Example usage
(async () => {
    await createAsset(); // Create the asset
    await issuePiCoins(100); // Issue 100 PiCoins
    const destinationAccount = 'DESTINATION_ACCOUNT_PUBLIC_KEY'; // Replace with the destination account public key
    await transferPiCoins(destinationAccount, 10); // Transfer 10 PiCoins
    const balance = await getBalance(accountId);
    console.log(`Your balance: ${balance} ${ASSET_CODE}`);
})();
