# ai/open_innovation_copilot.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("OpenInnovationCopilotAI")

class OpenInnovationCopilotAI:
    """
    Autonomous AI to attract, onboard, and support external developers, researchers, and open-source contributors.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def suggest_hackathons(self, ecosystem_needs: List[str], dev_community: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Suggests hackathon themes, challenge ideas, and engagement strategies to match ecosystem needs and developer interests.
        Returns:
            {
                "themes": [ ... ],
                "challenge_ideas": [ ... ],
                "outreach_plan": "..."
            }
        """
        prompt = (
            "You are an AI open innovation copilot for a global blockchain project. "
            "Given the platform's pressing needs and current developer community data, suggest the most attractive and impactful hackathon themes and challenge ideas. "
            "Advise on an outreach and onboarding plan."
            f"\nEcosystemNeeds: {json.dumps(ecosystem_needs)}"
            f"\nDevCommunity: {json.dumps(dev_community[:20])}"
            "\nReply in JSON: {\"themes\": [...], \"challenge_ideas\": [...], \"outreach_plan\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"OpenInnovationCopilotAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"OpenInnovationCopilotAI error: {e}")
            return {
                "themes": [],
                "challenge_ideas": [],
                "outreach_plan": f"AI error: {e}"
            }

    def mentor_contributor(self, contributor_profile: Dict[str, Any], repo_overview: str) -> str:
        """
        Provides personalized mentoring, onboarding, and resource suggestions for new contributors.
        """
        prompt = (
            "You are an AI mentor for open-source contributors. "
            "Given the contributor's profile and the repository overview, provide personalized onboarding tips, recommended resources, and a first-steps checklist."
            f"\nContributorProfile: {json.dumps(contributor_profile)}"
            f"\nRepoOverview: {repo_overview}"
        )
        try:
            response = self.ai.chat(prompt)
            logger.info("Provided onboarding for contributor")
            return response
        except Exception as e:
            logger.error(f"OpenInnovationCopilotAI error: {e}")
            return f"AI error: {e}"
