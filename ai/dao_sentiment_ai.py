# ai/dao_sentiment_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("DAOSentimentAI")

class DAOSentimentAI:
    """
    Autonomous AI to analyze DAO sentiment, governance trends, and predict proposal outcomes.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def analyze_sentiment(self, proposal_discussions: List[Dict[str, Any]], community_chat_logs: List[str]) -> Dict[str, Any]:
        """
        Analyzes social and governance sentiment around DAO proposals.
        Returns:
            {
                "overall_sentiment": "positive|neutral|negative",
                "key_issues": [...],
                "leading_arguments": [...],
                "predicted_outcome": "pass|fail|undecided",
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI for DAO sentiment and governance analysis. "
            "Given proposal discussions and community chat logs, determine the overall sentiment, highlight key issues and leading arguments, and predict the proposal outcome."
            f"\nProposalDiscussions: {json.dumps(proposal_discussions[-10:])}"
            f"\nCommunityChatLogs: {json.dumps(community_chat_logs[-50:])}"
            "\nReply in JSON: {\"overall_sentiment\": \"positive|neutral|negative\", \"key_issues\": [...], \"leading_arguments\": [...], \"predicted_outcome\": \"pass|fail|undecided\", \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("DAOSentimentAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"DAOSentimentAI error: {e}")
            return {
                "overall_sentiment": "undecided",
                "key_issues": [f"AI error: {e}"],
                "leading_arguments": [],
                "predicted_outcome": "undecided",
                "explanation": f"AI error: {e}"
            }
