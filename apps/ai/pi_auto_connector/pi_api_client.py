# apps/ai/pi_auto_connector/pi_api_client.py

import httpx
import asyncio
from typing import List, Dict, Any, Optional

class AsyncPiClient:
    """
    Async Pi Network API Client
    - Handles node discovery, connection, health checks, and reconnection.
    - Designed for use in ultra high-tech, AI-driven automation systems.
    """

    def __init__(self, api_base: str, api_key: str, timeout: int = 10):
        self.api_base = api_base.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    async def discover_nodes(self, strategy: str = "default") -> List[Dict[str, Any]]:
        """
        Discover available Pi Network nodes.
        :param strategy: Discovery strategy (AI-suggested or default)
        :return: List of node dicts
        """
        url = f"{self.api_base}/nodes"
        params = {"strategy": strategy}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, headers=self.headers, params=params)
            resp.raise_for_status()
            data = resp.json()
            return data.get("nodes", [])

    async def connect_node(self, node_id: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Connect to a specific Pi Network node.
        :param node_id: Node identifier (address or ID)
        :param params: Connection parameters (AI-generated)
        :return: Connection result dict
        """
        url = f"{self.api_base}/nodes/{node_id}/connect"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=self.headers, json=params)
            resp.raise_for_status()
            return resp.json()

    async def check_node_health(self, node_id: str) -> bool:
        """
        Check the health of a specific node.
        :param node_id: Node identifier
        :return: True if healthy, False otherwise
        """
        url = f"{self.api_base}/nodes/{node_id}/health"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, headers=self.headers)
                resp.raise_for_status()
                data = resp.json()
                return data.get("status", "unhealthy") == "healthy"
        except Exception as e:
            # Log or handle as needed
            return False

    async def reconnect_node(self, node_id: str, fix_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Attempt to reconnect to a node, optionally with AI-suggested parameters.
        :param node_id: Node identifier
        :param fix_params: AI-suggested fix parameters
        :return: Result dict
        """
        url = f"{self.api_base}/nodes/{node_id}/reconnect"
        payload = fix_params or {}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=self.headers, json=payload)
            resp.raise_for_status()
            return resp.json()

    # Optional: Additional Pi Network API calls (wallets, transactions, etc.)
    async def get_node_info(self, node_id: str) -> Dict[str, Any]:
        url = f"{self.api_base}/nodes/{node_id}/info"
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(url, headers=self.headers)
            resp.raise_for_status()
            return resp.json()
