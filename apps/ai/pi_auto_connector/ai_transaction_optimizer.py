# apps/ai/pi_auto_connector/ai_transaction_optimizer.py

import openai
import os
import logging
import json
from typing import Dict, Any, Optional, List

logger = logging.getLogger("AITransactionOptimizer")

class AITransactionOptimizer:
    """
    AI-powered transaction optimizer for Pi Network and similar blockchain environments.
    Provides dynamic fee calculation, route selection, risk assessment, and error mitigation
    using advanced LLMs (e.g., GPT-4o).
    """

    def __init__(self, openai_api_key: Optional[str] = None, model: str = "gpt-4o"):
        openai.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.model = model

    def optimize_transaction(
        self, 
        tx_data: Dict[str, Any], 
        network_state: Dict[str, Any],
        historical_data: Optional[List[Dict[str, Any]]] = None,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Use AI to recommend optimal transaction parameters: fee, route, risk, and mitigation.

        Args:
            tx_data: Transaction details (sender, receiver, amount, etc.)
            network_state: Current network state (congestion, fees, node status, etc.)
            historical_data: (Optional) Recent transactions for context/learning.
            user_preferences: (Optional) User's risk tolerance, fee preferences, etc.

        Returns:
            Dict with optimized parameters and AI rationale.
        """

        prompt = self._build_prompt(tx_data, network_state, historical_data, user_preferences)
        logger.info("Requesting AI optimization for transaction...")

        ai_response = self._call_openai(prompt, max_tokens=300)
        try:
            result = json.loads(ai_response)
            logger.info(f"AI optimization complete: {result}")
            return result
        except Exception as e:
            logger.error(f"AI response is not valid JSON: {e}\nResponse: {ai_response}")
            # Fallback: Use reasonable defaults
            return {
                "recommended_fee": network_state.get("min_fee", 0.01),
                "recommended_route": [tx_data.get("sender"), tx_data.get("receiver")],
                "risk_score": 0.1,
                "mitigation":: Free-text feedback (success, failed, slow, etc.)
            tx_result: Final transaction data (status, block, etc.)
        """
        logger.info(f"Received feedback for {tx_hash}: {user_feedback} | Result: {tx_result}")
        # In production, store feedback in a database or send to LLM training pipeline.

    def _build_prompt(
        self, 
        tx_data: Dict[str, Any], 
        network_state: Dict[str, Any],
        historical_data: Optional[List[Dict[str, Any]]] = None,
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Builds a detailed prompt for the LLM based on transaction and network context.
        """
        prompt = (
            "You are an expert in blockchain transaction optimization. "
            "Given the following transaction details, current network state, and (optionally) recent transaction history, "
            "recommend the optimal transaction fee, route, risk score (0-1, where 1=high risk), and suggest mitigation strategies for possible errors. "
            "Take user preferences (e.g., risk tolerance, speed vs. cost) into account if provided. "
            "Reply strictly in JSON with fields: recommended_fee, recommended_route, risk_score, mitigation, ai_comment.\n\n"
            f"Transaction: {json.dumps(tx_data)}\n"
            f"Network State: {json.dumps(network_state)}\n"
        )
        if historical_data:
            prompt += f"Recent Transactions: {json.dumps(historical_data[-5:])}\n"
        if user_preferences:
            prompt += f"User Preferences: {json.dumps(user_preferences)}\n"
        prompt += "Respond with a single JSON object only."
        return prompt

    def _call_openai(self, prompt: str, max_tokens: int = 256) -> str:
        """
        Calls OpenAI API to get a completion based on the prompt.
        """
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "system", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.15,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return '{}'
