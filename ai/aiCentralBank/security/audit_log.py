# aiCentralBank/security/audit_log.py

import hashlib
import datetime
import json
from typing import Dict, Any, List, Optional

class AuditLog:
    """
    Immutable audit log with hash chaining for tamper evidence.
    """

    def __init__(self):
        self.entries: List[Dict[str, Any]] = []
        self.last_hash: Optional[str] = None

    def record(self, event: Dict[str, Any]):
        timestamp = datetime.datetime.utcnow().isoformat()
        event_entry = {
            "timestamp": timestamp,
            "event": event,
            "prev_hash": self.last_hash
        }
        entry_str = json.dumps(event_entry, sort_keys=True)
        entry_hash = hashlib.sha256(entry_str.encode()).hexdigest()
        event_entry["hash"] = entry_hash
        self.entries.append(event_entry)
        self.last_hash = entry_hash

    def verify_chain(self) -> bool:
        prev_hash = None
        for entry in self.entries:
            expected_prev = entry["prev_hash"]
            if expected_prev != prev_hash:
                return False
            entry_copy = entry.copy()
            entry_hash = entry_copy.pop("hash")
            entry_str = json.dumps(entry_copy, sort_keys=True)
            actual_hash = hashlib.sha256(entry_str.encode()).hexdigest()
            if actual_hash != entry_hash:
                return False
            prev_hash = entry_hash
        return True

    def export(self, path: str):
        with open(path, "w") as f:
            json.dump(self.entries, f, indent=2)

# Example usage:
if __name__ == "__main__":
    log = AuditLog()
    log.record({"action": "simulate_policy", "params": {"rate": 0.03}})
    log.record({"action": "issue_cbdc", "amount": 1000000})
    print("Audit chain valid?", log.verify_chain())
    log.export("audit_log.json")
