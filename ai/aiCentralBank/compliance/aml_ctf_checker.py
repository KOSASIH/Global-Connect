# aiCentralBank/compliance/aml_ctf_checker.py

import re
import datetime
from typing import Dict, Any, List

class AMLCTFChecker:
    """
    Automated AML and CTF compliance checks using rules and AI patterns.
    """

    def __init__(self):
        self.suspicious_keywords = ['sanction', 'terror', 'fraud', 'offshore', 'shell']
        self.flagged_transactions = []

    def check_transaction(self, tx: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run compliance checks on a transaction.
        """
        reason = []
        if tx.get('amount', 0) > 1_000_000_000:
            reason.append('Large transaction amount')
        if re.search('|'.join(self.suspicious_keywords), str(tx.get('description', '')).lower()):
            reason.append('Suspicious keywords in description')
        if tx.get('country') in ['IR', 'KP', 'SY', 'SD', 'CU']:
            reason.append('Transaction with sanctioned country')
        # Placeholder for ML/AI anomaly detection
        if tx.get('anomaly_score', 0) > 0.8:
            reason.append('High anomaly score')
        result = {
            'tx_id': tx.get('id'),
            'flagged': bool(reason),
            'reasons': reason,
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        if result['flagged']:
            self.flagged_transactions.append(result)
        return result

    def batch_check(self, transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self.check_transaction(tx) for tx in transactions]

    def get_flagged(self) -> List[Dict[str, Any]]:
        return self.flagged_transactions

# Example usage:
if __name__ == "__main__":
    checker = AMLCTFChecker()
    txs = [
        {'id': 1, 'amount': 2_000_000_000, 'description': 'Payment to offshore account', 'country': 'SG'},
        {'id': 2, 'amount': 1000, 'description': 'Normal payment', 'country': 'US', 'anomaly_score': 0.9},
    ]
    print(checker.batch_check(txs))
    print("Flagged:", checker.get_flagged())
