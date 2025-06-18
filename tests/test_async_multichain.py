# tests/test_async_multichain.py

import asyncio
from global_connect.blockchain.cosmos_client import AsyncCosmosClient
from global_connect.blockchain.solana_client import AsyncSolanaClient

async def test_cosmos():
    cosmos = AsyncCosmosClient("https://cosmoshub-lcd.stake.fish")
    address = "cosmos1..."  # Put a valid Cosmos address here
    print("Cosmos Account Info:", await cosmos.get_account(address))
    print("Cosmos Balance (ATOM):", await cosmos.get_balance(address))

async def test_solana():
    solana = AsyncSolanaClient("https://api.mainnet-beta.solana.com")
    pubkey = "..."  # Put a valid Solana address here
    print("Solana Account Info:", await solana.get_account_info(pubkey))
    print("Solana Balance (SOL):", await solana.get_balance(pubkey))

async def main():
    await asyncio.gather(test_cosmos(), test_solana())

if __name__ == "__main__":
    asyncio.run(main())
