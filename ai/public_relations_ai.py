# ai/public_relations_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("PublicRelationsAI")

class PublicRelationsAI:
    """
    Autonomous AI for proactive and reactive PR, crisis management, and global communications.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def generate_press_release(self, topic: str, key_points: List[str], target_audience: str) -> str:
        """
        Drafts a press release for a given topic and audience.
        """
        prompt = (
            f"You are an AI public relations expert. Draft a concise, impactful press release on '{topic}'. "
            f"Key points: {json.dumps(key_points)}. Audience: {target_audience}. Make it clear, positive, and newsworthy."
        )
        try:
            response = self.ai.chat(prompt)
            logger.info("Generated press release")
            return response
        except Exception as e:
            logger.error(f"PublicRelationsAI error: {e}")
            return f"AI error: {e}"

    def handle_crisis(self, incident_details: str, potential_impacts: List[str], mitigation_actions: List[str]) -> Dict[str, Any]:
        """
        Crafts a crisis communication plan for rapid response and reputation management.
        Returns:
            {
                "public_statement": "...",
                "internal_message": "...",
                "media_QA": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI crisis communications and PR strategist. "
            "Given the incident details, potential impacts, and mitigation steps, draft a public statement, an internal message, and a media Q&A."
            f"\nIncidentDetails: {incident_details}"
            f"\nPotentialImpacts: {json.dumps(potential_impacts)}"
            f"\nMitigationActions: {json.dumps(mitigation_actions)}"
            "\nReply in JSON: {\"public_statement\": \"...\", \"internal_message\": \"...\", \"media_QA\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("Handled crisis communication")
            return result
        except Exception as e:
            logger.error(f"PublicRelationsAI error: {e}")
            return {
                "public_statement": "",
                "internal_message": "",
                "media_QA": [],
                "explanation": f"AI error: {e}"
            }
