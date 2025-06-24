# ai/grassroots_adoption_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("GrassrootsAdoptionAI")

class GrassrootsAdoptionAI:
    """
    Autonomous AI for hyperlocal adoption, community leader recruitment, and cultural resonance.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def identify_local_champions(self, region_data: Dict[str, Any], social_graph: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes local social graph and region data to recommend community leaders/influencers.
        Returns:
            {
                "champions": [ { "name": "...", "reason": "...", "contact_hint": "..." }, ... ],
                "strategy": "..."
            }
        """
        prompt = (
            "You are an AI expert in grassroots adoption for global Web3 projects. "
            "Given the following region data and social graph, identify the best local champions or influencers to drive community growth. "
            "Recommend initial engagement strategy."
            f"\nRegionData: {json.dumps(region_data)}"
            f"\nSocialGraph: {json.dumps(social_graph[:50])}"  # Limit for context size
            "\nReply in JSON: {\"champions\": [{\"name\": \"...\", \"reason\": \"...\", \"contact_hint\": \"...\"}, ...], \"strategy\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"GrassrootsAdoptionAI champions: {result}")
            return result
        except Exception as e:
            logger.error(f"GrassrootsAdoptionAI error: {e}")
            return {
                "champions": [],
                "strategy": f"AI error: {e}"
            }

    def auto_localize_content(self, content: str, language: str, cultural_context: str) -> str:
        """
        Instantly adapts and localizes content for any region/language/culture.
        """
        prompt = (
            f"Translate and localize the following content to {language}, adapting it for {cultural_context} culture and values. "
            f"Ensure phrasing and references are natural and locally resonant.\nContent: {content}"
        )
        try:
            response = self.ai.chat(prompt)
            logger.info("Auto-localized content to %s", language)
            return response
        except Exception as e:
            logger.error(f"GrassrootsAdoptionAI error: {e}")
            return f"AI error: {e}"
