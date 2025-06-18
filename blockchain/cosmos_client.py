# global_connect/blockchain/cosmos_client.py

import aiohttp
import asyncio

class AsyncCosmosClient:
    """
    Async client for Cosmos SDK-based blockchains using REST (LCD endpoint).
    """

    def __init__(self, lcd_url: str):
        self.lcd_url = lcd_url.rstrip('/')

    async def get_account(self, address: str):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.lcd_url}/cosmos/auth/v1beta1/accounts/{address}') as resp:
                resp.raise_for_status()
                return await resp.json()

    async def get_balance(self, address: str, denom: str = "uatom"):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.lcd_url}/cosmos/bank/v1beta1/balances/{address}') as resp:
                resp.raise_for_status()
                balances = (await resp.json())["balances"]
                for b in balances:
                    if b["denom"] == denom:
                        return float(b["amount"]) / 1e6
                return 0.0

    async def get_latest_block(self):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.lcd_url}/blocks/latest') as resp:
                resp.raise_for_status()
                return await resp.json()
