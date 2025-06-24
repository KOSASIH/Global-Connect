# ai/cross_chain_bridge_monitor.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("CrossChainBridgeMonitorAI")

class CrossChainBridgeMonitorAI:
    """
    Autonomous AI to monitor, analyze, and alert on cross-chain bridge health, risks, and exploits.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def monitor_bridges(self, bridge_statuses: List[Dict[str, Any]], event_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Scans cross-chain bridge data for anomalies, exploits, or downtime.
        Returns:
            {
                "issues_found": [...],
                "risk_level": "low|medium|high|critical",
                "recommended_actions": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for cross-chain bridge monitoring. "
            "Given bridge statuses and recent event logs, flag anomalies, exploits, or downtime. Assess risk level and recommend actions."
            f"\nBridgeStatuses: {json.dumps(bridge_statuses[-10:])}"
            f"\nEventLogs: {json.dumps(event_logs[-30:])}"
            "\nReply in JSON: {\"issues_found\": [...], \"risk_level\": \"low|medium|high|critical\", \"recommended_actions\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("CrossChainBridgeMonitorAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"CrossChainBridgeMonitorAI error: {e}")
            return {
                "issues_found": [f"AI error: {e}"],
                "risk_level": "low",
                "recommended_actions": [],
                "explanation": f"AI error: {e}"
            }
