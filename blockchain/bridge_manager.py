# global_connect/blockchain/bridge_manager.py

from typing import Optional, Dict, Any

class BridgeManager:
    """
    Cross-chain bridge manager for asset and message transfers.
    Supports modular bridge adapters: add your own for LayerZero, Wormhole, Axelar, etc.
    """

    def __init__(self):
        self.adapters: Dict[str, Any] = {}  # bridge_name -> adapter instance

    def add_bridge_adapter(self, bridge_name: str, adapter):
        """
        Register a bridge adapter (must implement a standard interface).
        """
        self.adapters[bridge_name.lower()] = adapter

    def remove_bridge_adapter(self, bridge_name: str):
        self.adapters.pop(bridge_name.lower(), None)

    def transfer_asset(self, bridge_name: str, from_chain: str, to_chain: str, asset: str, amount: float, from_address: str, to_address: str, **kwargs) -> Optional[str]:
        """
        Transfer assets cross-chain using the specified bridge.
        """
        adapter = self.adapters.get(bridge_name.lower())
        if not adapter:
            raise ValueError(f"Bridge adapter '{bridge_name}' not found")
        return adapter.transfer_asset(from_chain, to_chain, asset, amount, from_address, to_address, **kwargs)

    def transfer_message(self, bridge_name: str, from_chain: str, to_chain: str, message: str, **kwargs) -> Optional[str]:
        """
        Send a cross-chain message using the specified bridge.
        """
        adapter = self.adapters.get(bridge_name.lower())
        if not adapter:
            raise ValueError(f"Bridge adapter '{bridge_name}' not found")
        return adapter.transfer_message(from_chain, to_chain, message, **kwargs)
