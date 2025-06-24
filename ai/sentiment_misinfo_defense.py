# ai/sentiment_misinfo_defense.py

import json
import logging
from typing import List, Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("SentimentMisinfoDefenseAI")

class SentimentMisinfoDefenseAI:
    """
    Autonomous AI that monitors social sentiment, detects misinformation,
    and auto-generates positive, fact-based counter-messaging.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def monitor_and_counter(self, social_posts: List[Dict[str, Any]], facts_database: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reviews social posts, flags threats/misinformation, and generates counter-messages.
        Returns:
            {
                "flagged_posts": [
                    {
                        "post_id": "...",
                        "problem": "...",
                        "recommended_counter_message": "..."
                    },
                    ...
                ],
                "overall_sentiment": "positive|neutral|negative",
                "explanation": "..."
            }
        """
        sample_posts = social_posts[:20]  # Limit for context size
        prompt = (
            "You are an AI for global Web3 reputation and misinformation defense. "
            "Analyze the following social posts, using your facts database. "
            "For each post that contains misinformation or negative sentiment, flag it and draft a positive, fact-based counter-message. "
            "Summarize the overall sentiment and explain your findings."
            f"\nPosts: {json.dumps(sample_posts)}"
            f"\nFactsDB: {json.dumps(facts_database)}"
            "\nReply in JSON: {\"flagged_posts\": [{\"post_id\": \"...\", \"problem\": \"...\", \"recommended_counter_message\": \"...\"}, ...], \"overall_sentiment\": \"...\", \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"SentimentMisinfoDefenseAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"SentimentMisinfoDefenseAI error: {e}")
            return {
                "flagged_posts": [],
                "overall_sentiment": "unknown",
                "explanation": f"AI error: {e}"
            }
