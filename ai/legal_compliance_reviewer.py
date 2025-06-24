# ai/legal_compliance_reviewer.py

import json
import logging
from typing import Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("LegalComplianceReviewerAI")

class LegalComplianceReviewerAI:
    """
    Autonomous AI to review contracts, terms, code, and product features for global legal/regulatory compliance.
    """

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        self.ai = ai_provider or AIProvider()

    def review_contract(self, contract_text: str, jurisdiction: str, compliance_database: Dict[str, Any]) -> Dict[str, Any]:
        """
        Reviews a contract or agreement for legal risks and regulatory alignment.
        Returns:
            {
                "compliant": true/false,
                "issues": [ ... ],
                "required_changes": [ ... ],
                "explanation": "..."
            }
        """
        prompt = (
            f"You are an autonomous legal compliance reviewer for a global crypto project. "
            f"Check this contract for alignment with all relevant laws and regulations in {jurisdiction} using the compliance database. "
            f"Flag any issues, suggest required changes, and explain your reasoning."
            f"\nContract: {contract_text}"
            f"\nJurisdiction: {jurisdiction}"
            f"\nComplianceDB: {json.dumps(compliance_database)}"
            "\nReply in JSON: {\"compliant\": true/false, \"issues\": [...], \"required_changes\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"LegalComplianceReviewerAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"LegalComplianceReviewerAI error: {e}")
            return {
                "compliant": False,
                "issues": [f"AI error: {e}"],
                "required_changes": [],
                "explanation": "Could not complete compliance review."
            }

    def check_code_regulation(self, source_code: str, jurisdiction: str, compliance_database: Dict[str, Any]) -> Dict[str, Any]:
        """
        Checks code for regulatory risks, such as sanctions, privacy, or KYC/AML compliance.
        Returns:
            {
                "risk_found": true/false,
                "risk_details": [ ... ],
                "suggested_remediation": [ ... ],
                "explanation": "..."
            }
        """
        prompt = (
            f"You are an AI regulatory compliance auditor. "
            f"Analyze this code for any legal or regulatory risks in {jurisdiction}, referencing the compliance database. "
            f"Flag and describe all issues and propose remediations."
            f"\nSourceCode: {source_code}"
            f"\nJurisdiction: {jurisdiction}"
            f"\nComplianceDB: {json.dumps(compliance_database)}"
            "\nReply in JSON: {\"risk_found\": true/false, \"risk_details\": [...], \"suggested_remediation\": [...], \"explanation\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"LegalComplianceReviewerAI code audit: {result}")
            return result
        except Exception as e:
            logger.error(f"LegalComplianceReviewerAI error: {e}")
            return {
                "risk_found": False,
                "risk_details": [f"AI error: {e}"],
                "suggested_remediation": [],
                "explanation": "Could not complete code review."
            }
