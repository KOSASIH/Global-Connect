# stablecoin_guard.py

from .ai_provider import AIProvider
import json

class StablecoinGuardAI:
    def __init__(self, ai_provider):
        self.ai = ai_provider

    def check_price_integrity(self, transaction_data: dict, market_data: dict) -> dict:
        prompt = (
            "You are an AI stablecoin guard for Pi Coin. "
            "Given the latest transaction and market data, is Pi Coin being used at the correct $314159 value? "
            "Detect anomalies, attempts to manipulate, or off-peg events. Advise enforcement if needed.\n"
            f"Transaction: {json.dumps(transaction_data)}\n"
            f"MarketData: {json.dumps(market_data)}\n"
            "Reply in JSON: {\"peg_ok\": true|false, \"issues\": [..], \"enforcement\": [..]}"
        )
        response = self.ai.chat(prompt)
        return json.loads(response)
