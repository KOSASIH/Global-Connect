# ai/user_trust_score_ai.py

import json
import logging
from typing import Dict, Any, Optional, List

from .ai_provider import AIProvider

logger = logging.getLogger("UserTrustScoreAI")

class UserTrustScoreAI:
    """
    Autonomous AI to calculate user trust, reputation, and risk scores for ecosystem health, KYC, and anti-abuse.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def compute_score(self, user_profile: Dict[str, Any], user_history: List[Dict[str, Any]], global_risk_signals: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes a trust/reputation/risk score for a user based on profile, activity, and ecosystem risk context.
        Returns:
            {
                "score": 0.0,
                "tier": "trusted|normal|risky|blocked",
                "reasons": [ ... ],
                "recommendations": [ ... ]
            }
        """
        prompt = (
            "You are an autonomous AI for user trust and risk scoring in a global blockchain ecosystem. "
            "Given the user's profile, history, and global risk signals, compute a trust/reputation/risk score (0.0–100.0), assign a tier, explain the reasons, and give recommendations."
            f"\nUserProfile: {json.dumps(user_profile)}"
            f"\nUserHistory: {json.dumps(user_history[-20:])}"
            f"\nGlobalRiskSignals: {json.dumps(global_risk_signals)}"
            "\nReply in JSON: {\"score\": 0.0, \"tier\": \"trusted|normal|risky|blocked\", \"reasons\": [...], \"recommendations\": [...]}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"UserTrustScoreAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"UserTrustScoreAI error: {e}")
            return {
                "score": 0.0,
                "tier": "normal",
                "reasons": [f"AI error: {e}"],
                "recommendations": []
            }
