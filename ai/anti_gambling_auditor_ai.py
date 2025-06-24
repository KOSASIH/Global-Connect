# ai/anti_gambling_auditor_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("AntiGamblingAuditorAI")

class AntiGamblingAuditorAI:
    """
    Autonomous AI to audit code, content, and partner integrations to ensure NO gambling or betting applications are present.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def scan_application(self, app_metadata: Dict[str, Any], code_snippets: List[str], descriptions: List[str], partner_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Audits application metadata, code, descriptions, and partner apps for any signals of gambling/betting.
        Returns:
            {
                "gambling_detected": true/false,
                "evidence": [...],
                "risk_level": "none|suspicious|critical",
                "remediation_steps": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI compliance and safety auditor for a global ecosystem. "
            "Your strict mandate is to ensure NO gambling, betting, or wagering-related applications or features exist. "
            "Given the following app metadata, code snippets, descriptions, and partner list, check for any evidence of gambling or betting. "
            "If detected, return evidence, risk level, and remediation steps. Explain your reasoning."
            f"\nAppMetadata: {json.dumps(app_metadata)}"
            f"\nCodeSnippets: {json.dumps(code_snippets[:20])}"
            f"\nDescriptions: {json.dumps(descriptions[:10])}"
            f"\nPartnerList: {json.dumps(partner_list)}"
            "\nReply in JSON: {\"gambling_detected\": true/false, \"evidence\": [...], \"risk_level\": \"none|suspicious|critical\", \"remediation_steps\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("AntiGamblingAuditorAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"AntiGamblingAuditorAI error: {e}")
            return {
                "gambling_detected": False,
                "evidence": [f"AI error: {e}"],
                "risk_level": "none",
                "remediation_steps": [],
                "explanation": f"AI error: {e}"
            }

    def scan_content(self, content_list: List[str]) -> Dict[str, Any]:
        """
        Scans unstructured content (pages, posts, documentation) for gambling/betting keywords or intent.
        Returns:
            {
                "gambling_content_found": true/false,
                "matches": [...],
                "recommendations": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI content moderator for an anti-gambling policy. "
            "Scan the following content for any mention or promotion of gambling, betting, or wagering. "
            "If found, list matches and recommendations. Explain your findings."
            f"\nContentList: {json.dumps(content_list[:30])}"
            "\nReply in JSON: {\"gambling_content_found\": true/false, \"matches\": [...], \"recommendations\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("AntiGamblingAuditorAI content scan: %s", result)
            return result
        except Exception as e:
            logger.error(f"AntiGamblingAuditorAI error: {e}")
            return {
                "gambling_content_found": False,
                "matches": [f"AI error: {e}"],
                "recommendations": [],
                "explanation": f"AI error: {e}"
            }
