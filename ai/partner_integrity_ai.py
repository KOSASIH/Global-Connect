# ai/partner_integrity_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("PartnerIntegrityAI")

class PartnerIntegrityAI:
    """
    Autonomous AI to monitor, score, and flag risks in partner organizations, integrations, and collaborators.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def evaluate_partners(self, partner_profiles: List[Dict[str, Any]], activity_logs: List[Dict[str, Any]], blacklist: List[str]) -> Dict[str, Any]:
        """
        Evaluates partner integrity, flags risky behaviors, and recommends actions.
        Returns:
            {
                "partner_scores": [...],
                "risks_found": [...],
                "actions": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for assessing the integrity and risk of partner organizations in a digital ecosystem. "
            "Given partner profiles, activity logs, and a blacklist, score each partner, flag any risks, and recommend actions."
            f"\nPartnerProfiles: {json.dumps(partner_profiles)}"
            f"\nActivityLogs: {json.dumps(activity_logs[-50:])}"
            f"\nBlacklist: {json.dumps(blacklist)}"
            "\nReply in JSON: {\"partner_scores\": [...], \"risks_found\": [...], \"actions\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("PartnerIntegrityAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"PartnerIntegrityAI error: {e}")
            return {
                "partner_scores": [],
                "risks_found": [f"AI error: {e}"],
                "actions": [],
                "explanation": f"AI error: {e}"
            }
