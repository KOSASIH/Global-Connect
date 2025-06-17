# aiCentralBank/core/explainable_auditor.py

import datetime
import json
from typing import Dict, Any, List, Optional

class ExplainableAuditor:
    """
    Logs every action, provides human-readable explanations, and generates audit trails.
    """

    def __init__(self):
        self.log = []

    def record_action(self, actor: str, action: str, params: Dict[str, Any], result: Dict[str, Any], reason: Optional[str] = None):
        entry = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "actor": actor,
            "action": action,
            "parameters": params,
            "result": result,
            "reason": reason or self.generate_reason(action, params, result)
        }
        self.log.append(entry)

    def generate_reason(self, action: str, params: Dict[str, Any], result: Dict[str, Any]) -> str:
        # Basic explainability: can be replaced with LLM prompt/call for richer text
        return f"Action '{action}' applied with parameters {params}. Resulting state: {result}"

    def get_audit_trail(self) -> List[Dict[str, Any]]:
        return self.log.copy()

    def export_json(self, filepath: str):
        with open(filepath, "w") as f:
            json.dump(self.log, f, indent=2)

    def get_last_explanation(self) -> str:
        if not self.log:
            return "No actions recorded yet."
        return self.log[-1]["reason"]

# Example usage:
if __name__ == "__main__":
    auditor = ExplainableAuditor()
    auditor.record_action(
        actor="policy_engine",
        action="interest_rate_change",
        params={"interest_rate": 0.03},
        result={"gdp": 1_010_000_000, "inflation": 0.021}
    )
    print("Audit Trail:", auditor.get_audit_trail())
    print("Last Explanation:", auditor.get_last_explanation())
