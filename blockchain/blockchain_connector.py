# global_connect/blockchain/blockchain_connector.py

import os
from typing import Optional, Dict, Any, List
from web3 import Web3,": "..." }
        """
        self.provider_urls = provider_urls
        self.web3_instances = {
            name: Web3(Web3.HTTPProvider(url))
            for name, url in provider_urls.items()
        }
        self.default_network = next(iter(provider_urls))

    def get_web3(self, network: Optional[str] = None) -> Web3:
        net = network or self.default_network
        if net not in self.web3_instances:
            raise ValueError(f"No provider for network {net}")
        return self.web3_instances[net]

    def get_balance(self, address: str, network: Optional[str] = None[str] = None) -> Optional[Dict[str, Any]]:
        w3 = self.get_web3(network)
        try:
            return dict(w3.eth.get_transaction(tx_hash))
        except Exception as e:
            print(f"Transaction fetch error: {e}")
            return None

    def deploy_contract(self, abi: Any, bytecode: str, deployer_address: str, private_key: str, 
                       constructor_args: Optional[list] = None, network: Optional[str] = None,
                       gas: int = 1500000, gas_price_gwei: int = 50) -> Optional[str]:
        w3 str, abi: Any, function_name: str, args: list,
                              from_address: str, private_key: Optional[str] = None, value_ether: float = 0.0, 
                              network: Optional[str] = None, gas: int = 150000, gas_price_gwei: int = Real-time event listener for contract events or new blocks.
    """

    def __init__(self, web3_instance):
        self.web3 = web3_instance
        self.running = False

    def listen_for_event(self, contract, event_name: str, callback: Callable[[Any], None], poll_interval: float = 2.0):
        event_filter = getattr(contract.events, event_name).createFilter(fromBlock='latest')
        def poll():
            while self.running:
                for event in event_filter.get_new_entries():
                    callback(event)
                time.sleep(poll_interval)
        self.running = True
        threadingstaticmethod
    def save_wallet(wallet: dict, path: str):
        with open(path, "w") as f:
            json.dump(wallet, f)

    @staticmethod
    def load_wallet(path: str, password: Optional[str] = None) -> dict:
        with open(path, "r") as f:
            wallet = json.load(f)
        if "encrypted" in wallet and password:
            acct = Account.decrypt(wallet["encrypted"], password)
            return {"address": wallet["address"], "private_key": acct.hex()}
        return wallet
