# apps/ai/pi_partner_autonomous_ai/ops_copilot.py

import os
import json
import logging
from typing import Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("OpsCopilotAI")

class OpsCopilotAI:
    """
    Conversational AI operations copilot for Pi Coin partner ecosystem.
    Provides natural language dashboard, analytics, troubleshooting, and control.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def handle_query(self, query: str, system_state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a natural language query about the partner ecosystem, returning
        a JSON dict with the answer, actions, and AI's explanation.
        Example output:
        {
            "answer": "...",
            "actions": [ {"type": "pause_node", "node_id": "abc"}, ... ],
            "explanation": "..."
        }
        """
        prompt = (
            f"You are the AI operations copilot for the Pi Coin partner ecosystem. "
            f"SystemState: {json.dumps(system_state)}. "
            f"Query: {query}. "
            "Analyze the query, provide a direct answer with statistics or status if relevant, "
            "suggest any backend actions needed, and explain your reasoning in plain English. "
            "Respond with a JSON object: "
            "{\"answer\": \"...\", \"actions\": [..], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"OpsCopilotAI response for query '{query}': {result}")
            return result
        except Exception as e:
            logger.error(f"OpsCopilotAI error: {e}")
            return {
                "answer": "Sorry, I couldn't process the request due to an AI error.",
                "actions": [],
                "explanation": str(e)
            }

    def suggest_action(self, incident: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Given an operational incident (e.g., anomaly, failure, abuse), recommend actions.
        Example output:
        {
            "recommended_action": "...",
            "reason": "..."
        }
        """
        prompt = (
            "You are an expert AI operations advisor for Pi Coin partners. "
            f"Incident: {json.dumps(incident)}. "
            f"Context: {json.dumps(context)}. "
            "Based on this, recommend the best operational action and explain why. "
            "Reply in JSON: {\"recommended_action\": \"...\", \"reason\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"OpsCopilotAI incident action: {result}")
            return result
        except Exception as e:
            logger.error(f"OpsCopilotAI error (suggest_action): {e}")
            return {
                "recommended_action": "manual_review",
                "reason": f"AI error: {e}"
            }
