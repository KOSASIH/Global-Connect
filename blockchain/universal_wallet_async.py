# global_connect/blockchain/universal_wallet_async.py

from typing import Dict, Optional
from web3 import Web3

class AsyncUniversalWallet:
    """
    Async-ready, multi-chain universal wallet.
    Handles EVM, Cosmos, Solana, and can be extended.
    """

    def __init__(self):
        self.wallets: Dict[str, Dict] = {}

    async def add_wallet(self, chain_id: str, private_key: str, address: Optional[str] = None):
        """
        Add wallet for EVM, Cosmos, or Solana. Address can be computed if not given (for EVM).
        """
        if chain_id.startswith("evm"):
            w3 = Web3()
            acct = w3.eth.account.from_key(private_key)
            address = acct.address
        self.wallets[chain_id] = {"address": address, "private_key": private_key}

    async def get_address(self, chain_id: str) -> Optional[str]:
        wallet = self.wallets.get(chain_id)
        return wallet["address"] if wallet else None

    async def get_private_key(self, chain_id: str) -> Optional[str]:
        wallet = self.wallets.get(chain_id)
        return wallet["private_key"] if wallet else None

    async def list_wallets(self):
        return {cid: w["address"] for cid, w in self.wallets.items()}
