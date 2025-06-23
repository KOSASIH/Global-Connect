# compliance_engine.py

from .ai_provider import AIProvider
import json

class ComplianceEngineAI:
    def __init__(self, ai_provider):
        self.ai = ai_provider

    def assess_compliance(self, region: str, partner_profile: dict, tx_activity: dict) -> dict:
        prompt = (
            "You are an autonomous compliance AI for Pi Coin partner apps. "
            "Given the region, partner profile, and activity, check for KYC, AML, and regulatory compliance. "
            "Flag violations, and suggest improvements or blocks.\n"
            f"Region: {region}\n"
            f"Partner: {json.dumps(partner_profile)}\n"
            f"Activity: {json.dumps(tx_activity)}\n"
            "Reply in JSON: {\"compliant\": true|false, \"violations\": [..], \"suggestions\": [..]}"
        )
        response = self.ai.chat(prompt)
        return json.loads(response)
