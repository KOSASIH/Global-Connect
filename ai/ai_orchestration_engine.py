# ai/ai_orchestration_engine.py

import logging
from typing import Dict, Any, Optional

from .political_regulatory_navigator import PoliticalRegulatoryNavigatorAI
from .grassroots_adoption_ai import GrassrootsAdoptionAI
from .real_time_threat_intel_ai import RealTimeThreatIntelAI
from .user_trust_score_ai import UserTrustScoreAI
from .anomaly_defense import AnomalyDefenseAI
from .dao_proposal_copilot import DAOProposalCopilotAI

logger = logging.getLogger("AIOrchestrationEngine")

class AIOrchestrationEngine:
    """
    Unified orchestrator that coordinates multiple autonomous AI modules for holistic defense, compliance, and growth.
    """

    def __init__(self, ai_provider=None):
        self.political_ai = PoliticalRegulatoryNavigatorAI(ai_provider)
        self.grassroots_ai = GrassrootsAdoptionAI(ai_provider)
        self.threat_ai = RealTimeThreatIntelAI(ai_provider)
        self.trust_ai = UserTrustScoreAI(ai_provider)
        self.anomaly_ai = AnomalyDefenseAI(ai_provider)
        self.dao_ai = DAOProposalCopilotAI(ai_provider)

    def run_ecosystem_health_check(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs a comprehensive ecosystem health check, aggregating insights and actions from all major AIs.
        Returns:
            {
                "regulatory": ...,
                "grassroots": ...,
                "threats": ...,
                "trust": ...,
                "anomalies": ...,
                "governance": ...
            }
        """
        result = {}
        try:
            result["regulatory"] = self.political_ai.assess_regulatory_alignment(
                context.get("jurisdiction", "global"),
                context.get("project_features", {}),
                context.get("recent_news", "")
            )
            result["grassroots"] = self.grassroots_ai.identify_local_champions(
                context.get("region_data", {}),
                context.get("social_graph", [])
            )
            result["threats"] = self.threat_ai.scan_threats(
                context.get("logs", []),
                context.get("external_feeds", {}),
                context.get("attack_patterns", [])
            )
            result["trust"] = self.trust_ai.compute_score(
                context.get("user_profile", {}),
                context.get("user_history", []),
                context.get("global_risk_signals", {})
            )
            result["anomalies"] = self.anomaly_ai.detect_anomalies(
                context.get("partner_activity", []),
                context.get("code_changes", ""),
                context.get("system_context", {})
            )
            result["governance"] = self.dao_ai.draft_proposal(
                context.get("user_idea", ""),
                context.get("community_priorities", []),
                context.get("past_proposals", [])
            )
            logger.info("AIOrchestrationEngine health check complete")
            return result
        except Exception as e:
            logger.error(f"AIOrchestrationEngine error: {e}")
            return {"error": str(e)}
