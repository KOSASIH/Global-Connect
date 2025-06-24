# ai/network_health_monitor_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("NetworkHealthMonitorAI")

class NetworkHealthMonitorAI:
    """
    Autonomous AI to monitor, analyze, and forecast the overall health and reliability of the distributed network.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def evaluate_network(self, node_metrics: List[Dict[str, Any]], incident_reports: List[Dict[str, Any]], performance_thresholds: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates network health and reliability, flags issues, and suggests mitigations.
        Returns:
            {
                "health_score": 0.0,
                "major_issues": [...],
                "nodes_at_risk": [...],
                "mitigation_actions": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for distributed network health monitoring. "
            "Given node metrics, incident reports, and thresholds, score overall health, flag major issues, list nodes at risk, and suggest mitigations."
            f"\nNodeMetrics: {json.dumps(node_metrics[-20:])}"
            f"\nIncidentReports: {json.dumps(incident_reports[-10:])}"
            f"\nPerformanceThresholds: {json.dumps(performance_thresholds)}"
            "\nReply in JSON: {\"health_score\": 0.0, \"major_issues\": [...], \"nodes_at_risk\": [...], \"mitigation_actions\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("NetworkHealthMonitorAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"NetworkHealthMonitorAI error: {e}")
            return {
                "health_score": 0.0,
                "major_issues": [f"AI error: {e}"],
                "nodes_at_risk": [],
                "mitigation_actions": [],
                "explanation": f"AI error: {e}"
            }
