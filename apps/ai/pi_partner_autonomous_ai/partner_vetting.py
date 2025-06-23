# partner_vetting.py

from .ai_provider import AIProvider
import json

class PartnerVettingAI:
    def __init__(self, ai_provider):
        self.ai = ai_provider

    def vet_partner(self, partner_profile: dict, smart_contract_code: str) -> dict:
        prompt = (
            "You are an autonomous due-diligence and smart contract auditor for Pi Coin partner onboarding. "
            "Given the following partner profile and their smart contract code, evaluate:\n"
            "1. Is the business legitimate and safe?\n"
            "2. Does the code securely accept Pi Coin as $314159 stablecoin?\n"
            "3. List all potential risks or recommendations.\n"
            f"PartnerProfile: {json.dumps(partner_profile)}\n"
            f"SmartContract: {smart_contract_code}\n"
            "Reply in JSON: {\"approved\": true|false, \"reasons\": [..], \"recommendations\": [..]}"
        )
        response = self.ai.chat(prompt)
        return json.loads(response)
