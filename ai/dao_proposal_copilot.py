# ai/dao_proposal_copilot.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("DAOProposalCopilotAI")

class DAOProposalCopilotAI:
    """
    AI that helps community members and stakeholders draft, refine,
    and win support for governance proposals in DAOs.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def draft_proposal(
        self, 
        user_idea: str, 
        community_priorities: List[str], 
        past_proposals: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Turns a user-submitted idea into a well-structured, impactful DAO proposal.
        Returns:
            {
                "proposal_title": "...",
                "proposal_body": "...",
                "rationale": "...",
                "potential_issues": [ ... ]
            }
        """
        prompt = (
            "You are an AI copilot for DAO governance. "
            "Given a user-submitted idea, community priorities, and past proposals, draft the most effective possible new proposal. "
            "Highlight rationale and flag potential issues."
            f"\nUserIdea: {user_idea}"
            f"\nCommunityPriorities: {json.dumps(community_priorities)}"
            f"\nPastProposals: {json.dumps(past_proposals[-5:])}"
            "\nReply in JSON: {\"proposal_title\": \"...\", \"proposal_body\": \"...\", \"rationale\": \"...\", \"potential_issues\": [ ... ]}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"DAOProposalCopilotAI proposal: {result}")
            return result
        except Exception as e:
            logger.error(f"DAOProposalCopilotAI error: {e}")
            return {
                "proposal_title": "AI error",
                "proposal_body": "",
                "rationale": "",
                "potential_issues": [str(e)]
            }

    def optimize_for_passage(self, proposal: Dict[str, Any], voter_profiles: List[Dict[str, Any]]) -> str:
        """
        Refines proposal language and strategy to maximize passage rate.
        """
        prompt = (
            "You are an AI expert in DAO governance strategy. "
            "Given the proposal and typical voter profiles, optimize the proposal for maximum likelihood of passage."
            f"\nProposal: {json.dumps(proposal)}"
            f"\nVoterProfiles: {json.dumps(voter_profiles)}"
            "\nReturn the optimized proposal text."
        )
        try:
            response = self.ai.chat(prompt)
            logger.info("Optimized proposal for passage")
            return response
        except Exception as e:
            logger.error(f"DAOProposalCopilotAI error: {e}")
            return f"AI error: {e}"
