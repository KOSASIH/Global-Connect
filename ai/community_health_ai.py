# ai/community_health_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("CommunityHealthAI")

class CommunityHealthAI:
    """
    Autonomous AI for assessing community health, engagement, and predicting churn risks.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def assess_health(self, engagement_metrics: Dict[str, Any], sentiment_logs: List[str], churn_signals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates community health, flags churn risks, and suggests interventions.
        Returns:
            {
                "health_score": 0.0,
                "risk_factors": [...],
                "at_risk_segments": [...],
                "interventions": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for community health and churn prediction in a global platform. "
            "Given engagement metrics, sentiment logs, and churn signals, provide a health score, flag risk factors, detail at-risk segments, and recommend interventions."
            f"\nEngagementMetrics: {json.dumps(engagement_metrics)}"
            f"\nSentimentLogs: {json.dumps(sentiment_logs[-50:])}"
            f"\nChurnSignals: {json.dumps(churn_signals)}"
            "\nReply in JSON: {\"health_score\": 0.0, \"risk_factors\": [...], \"at_risk_segments\": [...], \"interventions\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("CommunityHealthAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"CommunityHealthAI error: {e}")
            return {
                "health_score": 0.0,
                "risk_factors": [f"AI error: {e}"],
                "at_risk_segments": [],
                "interventions": [],
                "explanation": f"AI error: {e}"
            }
