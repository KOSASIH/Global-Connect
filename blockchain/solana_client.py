# global_connect/blockchain/solana_client.py

import httpx
import asyncio
import base58

class AsyncSolanaClient:
    """
    Async client for Solana JSON RPC API.
    """

    def __init__(self, rpc_url: str):
        self.rpc_url = rpc_url

    async def get_balance(self, pubkey: str):
        async with httpx.AsyncClient() as client:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getBalance",
                "params": [pubkey]
            }
            resp = await client.post(self.rpc_url, json=payload)
            resp.raise_for_status()
            lamports = resp.json()["result"]["value"]
            return lamports / 1e9  # SOL

    async def get_account_info(self, pubkey: str):
        async with httpx.AsyncClient() as client:
            payload = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getAccountInfo",
                "params": [pubkey, {"encoding": "jsonParsed"}]
            }
            resp = await client.post(self.rpc_url, json=payload)
            resp.raise_for_status()
            return resp.json()["result"]["value"]

    # Add more methods as needed, such as send_transaction
