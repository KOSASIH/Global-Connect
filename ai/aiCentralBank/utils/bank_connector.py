# aiCentralBank/utils/bank_connector.py

import requests
from typing import Dict, Any

class BankConnector:
    """
    Interconnects with external banking APIs for payments, ledgers, and compliance.
    """

    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url
        self.headers = {"Authorization": f"Bearer {api_key}"}

    def get_balance(self, account_id: str) -> Dict[str, Any]:
        resp = requests.get(f"{self.api_url}/accounts/{account_id}/balance", headers=self.headers)
        resp.raise_for_status()
        return resp.json()

    def transfer(self, from_acc: str, to_acc: str, amount: float) -> Dict[str, Any]:
        payload = {"from": from_acc, "to": to_acc, "amount": amount}
        resp = requests.post(f"{self.api_url}/transfer", headers=self.headers, json=payload)
        resp.raise_for_status()
        return resp.json()

    def get_transactions(self, account_id: str, limit: int = 100) -> Dict[str, Any]:
        resp = requests.get(f"{self.api_url}/accounts/{account_id}/transactions?limit={limit}", headers=self.headers)
        resp.raise_for_status()
        return resp.json()

# Example usage:
if __name__ == "__main__":
    # connector = BankConnector("https://api.yourbank.com", "YOUR_API_KEY")
    # print(connector.get_balance("acc123"))
    pass
