# ai/regulatory_news_feed_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("RegulatoryNewsFeedAI")

class RegulatoryNewsFeedAI:
    """
    Autonomous AI for monitoring, summarizing, and alerting on global regulatory news and developments impacting digital assets.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def scan_and_alert(self, news_feeds: List[Dict[str, Any]], jurisdiction_list: List[str], compliance_keywords: List[str]) -> Dict[str, Any]:
        """
        Scans news feeds for regulatory developments, flags relevant news, and generates compliance alerts.
        Returns:
            {
                "flagged_news": [
                    {"title": "...", "jurisdiction": "...", "summary": "...", "impact_level": "low|medium|high", "alert": "..."},
                    ...
                ],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI specializing in global regulatory news for blockchain and fintech. "
            "Given news feeds, a list of jurisdictions, and compliance keywords, flag relevant news, summarize, assess impact, and generate actionable alerts."
            f"\nNewsFeeds: {json.dumps(news_feeds[:20])}"
            f"\nJurisdictions: {json.dumps(jurisdiction_list)}"
            f"\nKeywords: {json.dumps(compliance_keywords)}"
            "\nReply in JSON: {\"flagged_news\": [{\"title\": \"...\", \"jurisdiction\": \"...\", \"summary\": \"...\", \"impact_level\": \"low|medium|high\", \"alert\": \"...\"}], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("RegulatoryNewsFeedAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"RegulatoryNewsFeedAI error: {e}")
            return {
                "flagged_news": [],
                "explanation": f"AI error: {e}"
            }
