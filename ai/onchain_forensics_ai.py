# ai/onchain_forensics_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("OnchainForensicsAI")

class OnchainForensicsAI:
    """
    Autonomous AI for detecting fraud, laundering, and anomalies in on-chain activity.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def investigate_transactions(self, tx_data: List[Dict[str, Any]], risk_patterns: List[str], partner_lists: Dict[str, Any]) -> Dict[str, Any]:
        """
        Investigates transactions, flags suspicious activity, and provides forensic summaries.
        Returns:
            {
                "suspicious_txs": [...],
                "risk_level": "low|medium|high|critical",
                "forensic_summary": "...",
                "recommendations": [...]
            }
        """
        prompt = (
            "You are an AI for on-chain forensics and fraud detection. "
            "Given transaction data, known risk patterns, and partner lists, flag suspicious transactions, assign a risk level, summarize findings, and recommend actions."
            f"\nTxData: {json.dumps(tx_data[-50:])}"
            f"\nRiskPatterns: {json.dumps(risk_patterns)}"
            f"\nPartnerLists: {json.dumps(partner_lists)}"
            "\nReply in JSON: {\"suspicious_txs\": [...], \"risk_level\": \"low|medium|high|critical\", \"forensic_summary\": \"...\", \"recommendations\": [...]}"

        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("OnchainForensicsAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"OnchainForensicsAI error: {e}")
            return {
                "suspicious_txs": [],
                "risk_level": "low",
                "forensic_summary": f"AI error: {e}",
                "recommendations": []
            }
