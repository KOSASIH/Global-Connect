# global_connect/blockchain/universal_wallet.py

from typing import Dict, Optional
from web3 import Web3

class UniversalWallet:
    """
    Unified wallet abstraction for multi-chain use.
    Supports EVM and basic non-EVM account formats.
    """

    def __init__(self):
        self.wallets: Dict[str, Dict] = {}  # chain_id -> {address, private_key, ...}

    def add_wallet(self, chain_id: str, private_key: str):
        """
        Add/import a wallet for a specific chain.
        """
        # For EVM, derive address via Web3
        address = None
        if chain_id.startswith('evm') or chain_id.isnumeric():
            w3 = Web3()
            acct = w3.eth.account.from_key(private_key)
            address = acct.address
        # For others, define your logic here (e.g., for Cosmos, Solana, etc.)
        self.wallets[chain_id] = {"address": address, "private_key": private_key}

    def get_address(self, chain_id: str) -> Optional[str]:
        wallet = self.wallets.get(chain_id)
        return wallet["address"] if wallet else None

    def get_private_key(self, chain_id: str) -> Optional[str]:
        wallet = self.wallets.get(chain_id)
        return wallet["private_key"] if wallet else None

    def list_wallets(self):
        return {cid: w["address"] for cid, w in self.wallets.items()}

    def sign_transaction(self, chain_id: str, tx: dict) -> Optional[dict]:
        """
        Sign a transaction for the specified chain.
        """
        wallet = self.wallets.get(chain_id)
        if not wallet:
            return None
        private_key = wallet["private_key"]
        if chain_id.startswith('evm') or chain_id.isnumeric():
            w3 = Web3()
            signed = w3.eth.account.sign_transaction(tx, private_key)
            return signed
        # Extend here for non-EVM chains (e.g., ed25519 for Solana, etc.)
        return None
