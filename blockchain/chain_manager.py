# global_connect/blockchain/chain_manager.py

from typing import Dict, Optional

class ChainManager:
    """
    Manage supported chains (add, remove, query) for multichain operations.
    Supports EVM and non-EVM chains by storing metadata and provider endpoints.
    """

    def __init__(self):
        self.chains: Dict[str, Dict] = {}  # chain_id -> metadata

    def add_chain(self, name: str, chain_id: str, provider_url: str, chain_type: str = "EVM", explorer_url: Optional[str] = None, **kwargs):
)
        return chain["provider_url"] if chain else None
