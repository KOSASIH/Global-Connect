# apps/ai/pi_auto_connector/ai_agent.py

import openai
import os
import logging
import json
from typing import Dict, Any

logger = logging.getLogger("AIAgent")

class AIAgent:
    """
    AI-powered agent for dynamic decision-making, troubleshooting, and optimization.
    Utilizes OpenAI LLM for generating strategies, connection parameters, and self-healing solutions.
    """

    def __init__(self, openai_api_key: str = None, model: str = "gpt-4o"):
        openai.api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.model = model

    async def select_discovery_strategy(self) -> str:
        """
        Uses LLM to suggest the optimal node discovery strategy.
        """
        prompt = (
            "You are an expert blockchain network engineer. "
            "Given the need to discover and connect to all available Pi Network nodes "
            "as efficiently and reliably as possible, suggest the most effective discovery strategy. "
            "Reply with a simple strategy name or identifier (e.g., 'parallel-scan', 'geo-priority', 'hybrid-ai')."
        )
        logger.info("Requesting AI for discovery strategy...")
        result = self._call_openai(prompt, max_tokens=10)
        logger.info(f"AI selected strategy: {result}")
        return result

    async def get_connection_params(self, node: Dict[str, Any]) -> Dict[str, Any]:
        """
        Uses LLM to generate optimal connection parameters for a given node.
        """
        node_info = json.dumps(node)
        prompt = (
            f"You are an expert in distributed networks. "
            f"Given the following Pi Network node info:\n{node_info}\n"
            "Generate a JSON object for secure, robust connection parameters (e.g., handshake, retries, timeouts, security). "
            "Reply with JSON only."
        )
        logger.info(f"Requesting AI for connection params for node: {node.get('id', node)}")
        result = self._call_openai(prompt, max_tokens=100)
        try:
            params = json.loads(result)
        except Exception as e:
            logger.warning(f"AI response not valid JSON, fallback to defaults. Error: {e}")
            params = {"handshake": True, "retries": 3, "timeout": 10}
        return params

    async def suggest_fix(self, node: Dict[str, Any], error_msg: str) -> str:
        """
        Uses LLM to propose a fix or recovery strategy for a failed node connection.
        """
        node_info = json.dumps(node)
        prompt = (
            f"You are an AI troubleshooting assistant. "
            f"Node info:\n{node_info}\n"
            f"Error: {error_msg}\n"
            "Suggest a concise, actionable fix or workaround (e.g., reset handshake, increase timeout, use backup path)."
        )
        logger.info(f"Requesting AI for fix suggestion for node: {node.get('id', node)}")
        result = self._call_openai(prompt, max_tokens=40)
        return result.strip()

    def _call_openai(self, prompt: str, max_tokens: int = 50) -> str:
        """
        Synchronous wrapper for OpenAI completion (for use within async functions).
        """
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[{"role": "system", "content": prompt}],
                max_tokens=max_tokens,
                temperature=0.2,
            )
            content = response.choices[0].message.content
            return content.strip()
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return "default-strategy" if "strategy" in prompt.lower() else "{}"
