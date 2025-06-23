# trust_scoring.py

from .ai_provider import AIProvider
import json

class TrustScoringAI:
    def __init__(self, ai_provider):
        self.ai = ai_provider

    def score_partner(self, partner_profile: dict, tx_history: list, feedback: list) -> dict:
        prompt = (
            "You are an AI trust engine for Pi Coin partners. "
            "Score the partner based on their history, code, compliance, and user feedback. "
            "Suggest privilege changes if trust drops, with clear reasoning.\n"
            f"Profile: {json.dumps(partner_profile)}\n"
            f"TxHistory: {json.dumps(tx_history[-10:])}\n"
            f"Feedback: {json.dumps(feedback[-10:])}\n"
            "Reply in JSON: {\"trust_score\": 0-100, \"action\": \"upgrade|maintain|downgrade|block\", \"reason\": \"...\"}"
        )
        response = self.ai.chat(prompt)
        return json.loads(response)
