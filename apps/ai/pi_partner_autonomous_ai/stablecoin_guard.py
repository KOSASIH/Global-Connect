# apps/ai/pi_partner_autonomous_ai/stablecoin_guard.py

import json
import logging
from typing import Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("StablecoinGuardAI")

class StablecoinGuardAI:
    """
    Autonomous AI guard that enforces 1 Pi Coin = $314,159.
    Detects peg deviations, manipulation, and recommends or applies enforcement actions.
    """

    TARGET_PEG = 314159.0  # 1 Pi Coin = $314,159 fixed peg (USD)
    PEG_NAME = "Three hundred fourteen thousand, one hundred fifty-nine"

    def __init__(self, ai_provider: Optional[AIProvider] = None, peg_tolerance: float = 0.005):
        """
        peg_tolerance: allowed deviation (fraction, e.g., 0.005 = 0.5%) before enforcement triggers
        """
        self.ai = ai_provider or AIProvider()
        self.peg_tolerance = peg_tolerance

    def check_price_integrity(self, transaction_data: Dict[str, Any], market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verifies that Pi Coin is used at the fixed $314,159 peg, flags violations,
        explains reasoning, and recommends or applies enforcement actions.
        Returns:
            {
                "peg_ok": true/false,
                "deviation_percent": float,
                "issues": [ ... ],
                "enforcement": [ ... ],
                "explanation": "..."
            }
        """
        tx_price = self._extract_tx_price(transaction_data)
        deviation = (tx_price - self.TARGET_PEG) / self.TARGET_PEG if tx_price else 0
        peg_ok = abs(deviation) <= self.peg_tolerance

        if peg_ok:
            explanation = (
                f"Transaction value of 1 Pi = ${tx_price:,.2f} matches the enforced peg "
                f"(${self.TARGET_PEG:,.2f} - {self.PEG_NAME}) within allowed tolerance ({self.peg_tolerance*100:.2f}%)."
            )
            return {
                "peg_ok": True,
                "deviation_percent": deviation * 100,
                "issues": [],
                "enforcement": [],
                "explanation": explanation
            }

        # Off-peg case: use AI to analyze, explain, and recommend enforcement
        prompt = (
            f"You are an unstoppable AI stablecoin guard for Pi Coin. "
            f"The value of 1 Pi Coin is strictly set to ${self.TARGET_PEG:,.2f} ({self.PEG_NAME}) USD. "
            f"Allowed deviation is ±{self.peg_tolerance*100:.2f}%. "
            "Given the following transaction and market data, answer:\n"
            "1. Is the transaction off-peg? By how much?\n"
            "2. List all suspicious indicators (manipulation, abnormal flow, arbitrage, etc).\n"
            "3. Recommend enforcement actions (block, alert, require resettlement, etc).\n"
            "4. Give a clear, plain-English explanation for your recommendations.\n\n"
            f"TransactionData: {json.dumps(transaction_data)}\n"
            f"MarketData: {json.dumps(market_data)}\n"
            "Reply in JSON: {"
            "\"peg_ok\": true|false, "
            "\"deviation_percent\": float, "
            "\"issues\": [..], "
            "\"enforcement\": [..], "
            "\"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.warning(f"Peg violation detected: {result}")
            return result
        except Exception as e:
            logger.error(f"StablecoinGuardAI error: {e}")
            return {
                "peg_ok": False,
                "deviation_percent": deviation * 100,
                "issues": ["AI guard error: could not fully analyze transaction."],
                "enforcement": ["manual_review"],
                "explanation": f"AI error: {e}"
            }

    def _extract_tx_price(self, transaction_data: Dict[str, Any]) -> float:
        """
        Extracts the effective USD value per Pi in this transaction.
        """
        try:
            # Assume transaction_data has: 'amount_pi', 'amount_usd'
            pi = float(transaction_data.get("amount_pi", 1))
            usd = float(transaction_data.get("amount_usd", 0))
            return usd / pi if pi else 0
        except Exception:
            return 0
