# aiCentralBank/core/digital_currency_manager.py

class DigitalCurrencyManager:
    """
    Manage central bank digital currency (CBDC) issuance, supply, and anomaly detection.
    """

    def __init__(self):
        self.supply = 0
        self.ledger = []

    def issue(self, amount: float):
        self.supply += amount
        self.ledger.append({'action': 'issue', 'amount': amount})
        self._log(f"Issued {amount} CBDC units.")

    def burn(self, amount: float):
        if amount > self.supply:
            raise ValueError("Cannot burn more than current supply.")
        self.supply -= amount
        self.ledger.append({'action': 'burn', 'amount': amount})
        self._log(f"Burned {amount} CBDC units.")

    def transfer(self, from_account: str, to_account: str, amount: float):
        # Placeholder for account-based transfer logic (expand with real ledger and anti-fraud here)
        self.ledger.append({'action': 'transfer', 'from': from_account, 'to': to_account, 'amount': amount})
        self._log(f"Transferred {amount} from {from_account} to {to_account}.")

    def detect_anomalies(self) -> list:
        # Placeholder: insert ML anomaly detection here
        flagged = [tx for tx in self.ledger if tx['amount'] > 1_000_000_000]
        if flagged:
            self._log(f"Anomalies detected: {flagged}")
        return flagged

    def get_supply(self) -> float:
        return self.supply

    def _log(self, msg: str):
        print(f"[DigitalCurrencyManager] {msg}")

    def get_ledger(self):
        return self.ledger.copy()


# Example usage:
if __name__ == '__main__':
    dcm = DigitalCurrencyManager()
    dcm.issue(1_000_000)
    dcm.transfer('central_bank', 'bank_A', 500_000)
    dcm.burn(100_000)
    print("Supply:", dcm.get_supply())
    print("Ledger:", dcm.get_ledger())
    print("Anomalies:", dcm.detect_anomalies())
