# ai/real_time_threat_intel_ai.py

import json
import logging
from typing import Dict, Any, Optional, List

from .ai_provider import AIProvider

logger = logging.getLogger("RealTimeThreatIntelAI")

class RealTimeThreatIntelAI:
    """
    Autonomous AI to monitor, analyze, and alert on real-time threats across the ecosystem.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def scan_threats(self, logs: List[Dict[str, Any]], external_feeds: Dict[str, Any], attack_patterns: List[str]) -> Dict[str, Any]:
        """
        Scans activity logs and threat feeds for signs of attacks, exploits, or coordinated abuse.
        Returns:
            {
                "threats_found": [ { "type": "...", "details": "...", "severity": "low|medium|high" }, ... ],
                "alerts": [ ... ],
                "recommendations": [ ... ]
            }
        """
        prompt = (
            "You are an AI for real-time threat intelligence in a global blockchain ecosystem. "
            "Analyze recent logs, external threat feeds, and attack patterns for signs of exploit, attack, or coordinated abuse. "
            "List threats found, generate alerts, and give actionable recommendations."
            f"\nLogs: {json.dumps(logs[-30:])}"
            f"\nExternalFeeds: {json.dumps(external_feeds)}"
            f"\nAttackPatterns: {json.dumps(attack_patterns)}"
            "\nReply in JSON: {\"threats_found\": [{\"type\": \"...\", \"details\": \"...\", \"severity\": \"low|medium|high\"}, ...], \"alerts\": [...], \"recommendations\": [...]}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"RealTimeThreatIntelAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"RealTimeThreatIntelAI error: {e}")
            return {
                "threats_found": [],
                "alerts": [f"AI error: {e}"],
                "recommendations": []
            }
