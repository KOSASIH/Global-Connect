# global_connect/blockchain/user_wallet.py

from web3 import Web3, Account
import os
import json
from typing import Optional

class UserWallet:
    """
    Secure user wallet utility.
    """

    @staticmethod
    def create_wallet(password: Optional[str] = None) -> dict:
        acct = Account.create()
        if password:
            encrypted = Account.encrypt(acct.privateKey, password)
            return {"address": acct.address, "encrypted": encrypted}
        else:
            return {"address": acct.address, "private_key": acct.privateKey.hex()}

    @staticmethod
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
