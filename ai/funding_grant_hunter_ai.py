# ai/funding_grant_hunter_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("FundingGrantHunterAI")

class FundingGrantHunterAI:
    """
    Autonomous AI to find and draft applications to global funding/grant opportunities.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def find_grants(self, project_profile: Dict[str, Any], funding_db: List[Dict[str, Any]], region: str) -> Dict[str, Any]:
        """
        Scans funding database, matches the best opportunities for the project, and proposes application strategies.
        Returns:
            {
                "best_grants": [
                    {
                        "name": "...",
                        "fit_score": 0.0,
                        "reason": "...",
                        "deadline": "...",
                        "contact": "..."
                    }, ...
                ],
                "strategy": "..."
            }
        """
        prompt = (
            "You are an AI grant/funding hunter for global digital projects. "
            "Given the project profile, region, and a funding database, recommend the best matching grants/funds, with reasons and deadlines. "
            "Outline an application strategy."
            f"\nProjectProfile: {json.dumps(project_profile)}"
            f"\nRegion: {region}"
            f"\nFundingDB: {json.dumps(funding_db[:20])}"
            "\nReply in JSON: {\"best_grants\": [{\"name\": \"...\", \"fit_score\": 0.0, \"reason\": \"...\", \"deadline\": \"...\", \"contact\": \"...\"}, ...], \"strategy\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"FundingGrantHunterAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"FundingGrantHunterAI error: {e}")
            return {
                "best_grants": [],
                "strategy": f"AI error: {e}"
            }

    def draft_application(self, grant_info: Dict[str, Any], project_profile: Dict[str, Any]) -> str:
        """
        Drafts a grant application or pitch for the selected funding opportunity.
        """
        prompt = (
            "You are an expert AI grant application writer. "
            "Draft a compelling application for this grant:\n"
            f"GrantInfo: {json.dumps(grant_info)}\n"
            f"ProjectProfile: {json.dumps(project_profile)}"
            "\nReturn the application text."
        )
        try:
            response = self.ai.chat(prompt)
            logger.info("Drafted grant application")
            return response
        except Exception as e:
            logger.error(f"FundingGrantHunterAI error: {e}")
            return f"AI error: {e}"
