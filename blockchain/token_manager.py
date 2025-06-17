import json
from typing import Any, Optional, Union"}],
            "name": "transfer",
            "outputs": [{"name": "success", "type": "bool"}],
            "type": "function",
        },
        {
            "constant": True,
            "inputs": [],
            "name": "decimals",
            "outputs": [{"name": "", "type": "uint8"}],
            "type": "function",
        },
        {
            "constant": True,
            "inputs": [],
            "name": "symbol",
            "outputs": [{"name": "", "type"}],
            "name": "token "": [{"name": "", "type": "string"}],
            "type": "function",
        },
    ]

    # Minimal ERC-1155 ABI (multi-token standard)
    ERC1155_ABI = [
        {
            "constant": True,
            "inputs": [
                {".contract(address=w3.toChecksumAddress(token_address), abi=self.ERC20_ABI)
        try:
            balance = contract.functions.balanceOf(w3.toChecksumAddress(user_address)).call()
            decimals = contract.functions.decimals().call()
            return balance / (10 ** decimals)
        except Exception as e:
            print(f"ERC = w3.eth.account.sign_transaction(tx, private_key)
            tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
            return w3.toHex(tx_hash)
        except Exception as e:
            print(f"ERC20 transfer error: {e}")
            return None

    # ------ ERC-721 Methods ------

    def get_erc721_owner(self, nft_address: str, token_id: int,.toHex(tx_hash)
        except Exception as e:
            print(f"ERC721 transfer error: {e}")
            return None

    def get_erc721_token_uri(self, nft_address: str, token_id: int, network: Optional[str] = None) -> Optional[str]:
        w3 = self.connector.get.connector.get_web3(network)
        contract = w3.eth.contract(address=w3.toChecksumAddress(contract_address), abi=self.ERC1155_ABI)
        try:
            tx = contract.functions.safeTransferFrom(
                w3.toChecksumAddress(from_addr),
                w3.toChecksumAddress(to_addr),
                token_id,
                amount,
                data
            ).build['name'] == event_name), None)
            if not event_abi:
                raise Exception(f"Event {event_name} not found in ABI")
            return contract.events[event_name]().processReceipt(tx_receipt)
        except Exception as e:
            print(f"Decode event error: {e}")
            return None
