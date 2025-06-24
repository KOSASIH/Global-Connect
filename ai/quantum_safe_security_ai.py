# ai/quantum_safe_security_ai.py

import json
import logging
from typing import Dict, Any, List, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("QuantumSafeSecurityAI")

class QuantumSafeSecurityAI:
    """
    Autonomous AI to assess blockchain, messaging, and cryptographic systems for quantum-resistance and post-quantum upgrade needs.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def audit_system(self, system_arch: Dict[str, Any], crypto_suite: List[str], threat_model: Dict[str, Any]) -> Dict[str, Any]:
        """
        Audits a system for quantum risks and recommends post-quantum cryptography upgrades.
        Returns:
            {
                "quantum_safe": true/false,
                "vulnerabilities": [...],
                "upgrade_recommendations": [...],
                "explanation": "..."
            }
        """
        prompt = (
            "You are an AI security auditor specializing in quantum-safe cryptography. "
            "Given the system architecture, cryptographic suite, and threat model, assess quantum vulnerability and recommend post-quantum upgrades."
            f"\nSystemArch: {json.dumps(system_arch)}"
            f"\nCryptoSuite: {json.dumps(crypto_suite)}"
            f"\nThreatModel: {json.dumps(threat_model)}"
            "\nReply in JSON: {\"quantum_safe\": true/false, \"vulnerabilities\": [...], \"upgrade_recommendations\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info("QuantumSafeSecurityAI result: %s", result)
            return result
        except Exception as e:
            logger.error(f"QuantumSafeSecurityAI error: {e}")
            return {
                "quantum_safe": False,
                "vulnerabilities": [f"AI error: {e}"],
                "upgrade_recommendations": [],
                "explanation": f"AI error: {e}"
            }
