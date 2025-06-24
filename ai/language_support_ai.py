# ai/language_support_ai.py

import json
import logging
from typing import List, Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("LanguageSupportAI")

class LanguageSupportAI:
    """
    Autonomous AI for detecting languages, flagging accessibility gaps, and recommending localization/translation priorities.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def analyze_content(self, content_samples: List[str], supported_languages: List[str], user_demographics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detects languages present, flags gaps in language support, and prioritizes localization needs.
        Returns:
            {
                "languages_detected": [...],
                "coverage_gaps": [...],
                "priority_recommendations": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for global language detection and accessibility. "
            "Given content samples, supported languages, and user demographics, detect which languages are present, flag any coverage gaps, and recommend localization priorities."
            f"\nContentSamples: {json.dumps(content_samples[:30])}"
            f"\nSupportedLanguages: {json.dumps(supported_languages)}"
            f"\nUserDemographics: {json.dumps(user_demographics)}"
            "\nReply in JSON: {\"languages_detected\": [...], \"coverage_gaps\": [...], \"priority_recommendations\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("LanguageSupportAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"LanguageSupportAI error: {e}")
            return {
                "languages_detected": [],
                "coverage_gaps": [f"AI error: {e}"],
                "priority_recommendations": [],
                "explanation": f"AI error: {e}"
            }
