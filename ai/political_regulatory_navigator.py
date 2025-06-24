# ai/political_regulatory_navigator.py

import json
import logging
from typing import Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("PoliticalRegulatoryNavigatorAI")

class PoliticalRegulatoryNavigatorAI:
    """
    Autonomous AI that continuously maps and adapts to political and regulatory realities,
    proactively aligns operations, and crafts diplomatic outreach.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def assess_regulatory_alignment(self, jurisdiction: str, project_features: Dict[str, Any], recent_news: str) -> Dict[str, Any]:
        """
        Analyze if project features and operations are aligned with the latest laws/policies.
        Returns:
            {
                "aligned": true/false,
                "risks": [..],
                "recommended_actions": [..],
                "explanation": "..."
            }
        """
        prompt = (
            f"You are an autonomous AI for political and regulatory alignment of a global Web3 project. "
            f"Jurisdiction: {jurisdiction}\n"
            f"ProjectFeatures: {json.dumps(project_features)}\n"
            f"RecentNews: {recent_news}\n"
            "Do project features and operations comply with the latest laws and political realities? "
            "List all risks and recommend concrete next actions for alignment, including diplomatic outreach if needed. "
            "Explain in clear, plain English. "
            "Respond in JSON: "
            "{\"aligned\": true/false, \"risks\": [..], \"recommended_actions\": [..], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"PoliticalRegulatoryNavigatorAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"PoliticalRegulatoryNavigatorAI error: {e}")
            return {
                "aligned": False,
                "risks": [f"AI error: {e}"],
                "recommended_actions": ["manual_review"],
                "explanation": "Failed to process alignment check."
            }

    def generate_policy_brief(self, jurisdiction: str, topic: str, audience: str) -> str:
        """
        Generate a policy brief or diplomatic letter for a specific jurisdiction and audience.
        """
        prompt = (
            f"You are an AI policy advocacy copilot. Craft a persuasive, accurate, and locally relevant policy brief "
            f"for the {audience} in {jurisdiction} about: {topic}. "
            "Be concise, diplomatic, and actionable."
        )
        try:
            response = self.ai.chat(prompt, max_tokens=800)
            logger.info("Generated policy brief for %s audience %s", jurisdiction, audience)
            return response
        except Exception as e:
            logger.error(f"PoliticalRegulatoryNavigatorAI error: {e}")
            return f"AI error: {e}"
