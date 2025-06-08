// tests/PiCoin.test.js
const StellarSdk = require('stellar-sdk');
const assert = require('assert');

// Configure Stellar network
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
const keypair = StellarSdk.Keypair.fromSecret('YOUR_SECRET_KEY'); // Replace with your secret key
const accountId = keypair.publicKey();
const ASSET_CODE = 'PI';
const ASSET_ISSUER = accountId;

describe('PiCoin Tests', function() {
    it('should create a new asset', async function() {
        const account = await server.loadAccount(accountId);
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(StellarSdk.Operation.changeTrust({
            asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
            limit: '1000000',
        }))
        .setTimeout(30)
        .build();

        transaction.sign(keypair);
        const result = await server.submitTransaction(transaction);
        assert.ok(result, 'Asset creation failed');
    });

    it('should issue new PiCoins', async function() {
        const amount = 100;
        const account = await server.loadAccount(ASSET_ISSUER);
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: accountId,
            asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(keypair);
        const result = await server.submitTransaction(transaction);
        assert.ok(result, 'Issuing PiCoins failed');
    });

    it('should transfer PiCoins', async function() {
        const destinationAccount = 'DESTINATION_ACCOUNT_PUBLIC_KEY'; // Replace with the destination account public key
        const amount = 10;
        const account = await server.loadAccount(accountId);
        const transaction = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        .addOperation(StellarSdk.Operation.payment({
            destination: destinationAccount,
            asset: new StellarSdk.Asset(ASSET_CODE, ASSET_ISSUER),
            amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

        transaction.sign(keypair);
        const result = await server.submitTransaction(transaction);
        assert.ok(result, 'Transfer of PiCoins failed');
    });

    it('should get the balance of an account', async function() {
        const account = await server.loadAccount(accountId);
        const balances = account.balances;
        const piCoinBalance = balances.find(b => b.asset_code === ASSET_CODE);
        assert.ok(piCoinBalance, 'Balance retrieval failed');
        console.log(`Your balance: ${piCoinBalance.balance} ${ASSET_CODE}`);
    });
});
