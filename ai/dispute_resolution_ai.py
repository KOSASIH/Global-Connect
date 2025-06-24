# ai/dispute_resolution_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("DisputeResolutionAI")

class DisputeResolutionAI:
    """
    Autonomous AI mediator for resolving disputes between users, partners, or ecosystem entities.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def mediate_dispute(self, party_a: Dict[str, Any], party_b: Dict[str, Any], dispute_details: str, evidence: List[str]) -> Dict[str, Any]:
        """
        Analyzes dispute details, weighs evidence, and proposes a fair resolution.
        Returns:
            {
                "resolution_summary": "...",
                "verdict": "party_a|party_b|split|no_decision",
                "justification": "...",
                "follow_up_actions": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an autonomous AI mediator and arbitrator. Given the parties' profiles, dispute details, and evidence, analyze and propose a fair, transparent resolution. "
            "Summarize the dispute, state a verdict, justify your decision, and suggest follow-up actions."
            f"\nPartyA: {json.dumps(party_a)}"
            f"\nPartyB: {json.dumps(party_b)}"
            f"\nDisputeDetails: {dispute_details}"
            f"\nEvidence: {json.dumps(evidence)}"
            "\nReply in JSON: {\"resolution_summary\": \"...\", \"verdict\": \"party_a|party_b|split|no_decision\", \"justification\": \"...\", \"follow_up_actions\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"DisputeResolutionAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"DisputeResolutionAI error: {e}")
            return {
                "resolution_summary": "AI error",
                "verdict": "no_decision",
                "justification": f"AI error: {e}",
                "follow_up_actions": [],
                "explanation": "Could not process dispute."
            }
