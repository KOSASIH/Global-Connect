# apps/ai/pi_auto_connector/connector.py

import asyncio
from typing import List, Dict, Any, Optional
import logging
from .pi_api_client import AsyncPiClient
from .ai_agent import AIAgent

logger = logging.getLogger("PiAutoConnector")
logging.basicConfig(level=logging.INFO)

class PiAutoConnector:
    """
    Ultra high-tech, feature-rich, AI-driven auto-connector for Pi Network.
    - Discovers, connects, and maintains all Pi Network nodes.
    - Uses AI for optimal strategies and auto-troubleshooting.
    """

    def __init__(
        self,
        pi_api_base: str,
        pi_api_key: str,
        openai_api_key: str,
        node_discovery_interval: int = 600,
        health_check_interval: int = 300,
    ):
        self.client = AsyncPiClient(pi_api_base, pi_api_key)
        self.ai_agent = AIAgent(openai_api_key)
        self.node_discovery_interval = node_discovery_interval
        self.health_check_interval = health_check_interval
        self.connected_nodes: Dict[str, Dict[str, Any]] = {}  # node_id: {status, metadata}
        self._running = False

    async def auto_discover_and_connect(self):
        """
        Discovers new nodes and connects using AI-optimized strategies.
        """
        logger.info("Auto-discovery and connection process started.")
        strategy = await self.ai_agent.select_discovery_strategy()
        logger.info(f"AI selected discovery strategy: {strategy}")
        nodes = await self.client.discover_nodes(strategy=strategy)
        logger.info(f"Discovered {len(nodes)} Pi nodes.")

        connect_tasks = []
        for node in nodes:
            connect_tasks.append(self.connect_node_with_ai(node))
        results = await asyncio.gather(*connect_tasks)
        logger.info("Connection results: %s", results)
        return results

    async def connect_node_with_ai(self, node: Dict[str, Any]):
        """
        Connects to a node using AI-suggested parameters and handles errors with AI assistance.
        """
        node_id = node.get("id") or node.get("address") or str(node)
        try:
            params = await self.ai_agent.get_connection_params(node)
            logger.info(f"Connecting to node {node_id} with params: {params}")
            result = await self.client.connect_node(node_id, params)
            self.connected_nodes[node_id] = {
                "status": "connected",
                "metadata": node,
                "last_success": asyncio.get_event_loop().time(),
            }
            logger.info(f"Connected to node {node_id}")
            self.on_connect(node_id, result)
            return {"node": node_id, "status": "connected"}
        except Exception as e:
            logger.error(f"Error connecting to node {node_id}: {e}")
            fix = await self.ai_agent.suggest_fix(node, str(e))
            logger.info(f"AI suggested fix for node {node_id}: {fix}")
            self.connected_nodes[node_id] = {
                "status": "error",
                "metadata": node,
                "last_error": asyncio.get_event_loop().time(),
                "error": str(e),
                "ai_fix": fix,
            }
            self.on_error(node_id, str(e), fix)
            return {"node": node_id, "status": "error", "error": str(e), "fix": fix}

    async def health_check_loop(self):
        """
        Periodically checks the health of all connected nodes and auto-heals using AI if needed.
        """
        logger.info("Health check loop started.")
        while self._running:
            await asyncio.sleep(self.health_check_interval)
            logger.info("Running health checks for all connected nodes.")
            for node_id, info in list(self.connected_nodes.items()):
                try:
                    healthy = await self.client.check_node_health(node_id)
                    if healthy:
                        logger.info(f"Node {node_id} is healthy.")
                        self.connected_nodes[node_id]["status"] = "connected"
                    else:
                        logger.warning(f"Node {node_id} is unhealthy. Attempting self-heal.")
                        fix = await self.ai_agent.suggest_fix(info["metadata"], "Unhealthy node")
                        await self.client.reconnect_node(node_id, fix)
                        self.connected_nodes[node_id]["status"] = "recovered"
                        logger.info(f"Node {node_id} recovered using AI fix.")
                        self.on_recover(node_id, fix)
                except Exception as e:
                    logger.error(f"Health check failed for node {node_id}: {e}")
                    self.connected_nodes[node_id]["status"] = "error"
                    self.on_error(node_id, str(e), None)

    async def run(self):
        """
        Starts the unstoppable Pi auto-connector loop.
        """
        self._running = True
        await self.auto_discover_and_connect()
        asyncio.create_task(self.discovery_loop())
        asyncio.create_task(self.health_check_loop())

    async def stop(self):
        """
        Stops the auto-connector.
        """
        self._running = False

    async def discovery_loop(self):
        """
        Periodically discovers and auto-connects new nodes.
        """
        while self._running:
            await asyncio.sleep(self.node_discovery_interval)
            logger.info("Running periodic node discovery.")
            await self.auto_discover_and_connect()

    # --- Event hooks for extensions or analytics ---
    def on_connect(self, node_id: str, result: Any):
        logger.info(f"[Event] Node connected: {node_id}")

    def on_error(self, node_id: str, error_msg: str, ai_fix: Optional[str]):
        logger.error(f"[Event] Node error: {node_id}, Error: {error_msg}, AI Fix: {ai_fix}")

    def on_recover(self, node_id: str, ai_fix: str):
        logger.info(f"[Event] Node recovered: {node_id}, AI Fix: {ai_fix}")

# Example of launching the unstoppable connector (to be used in your main app or async runner)
# if __name__ == "__main__":
#     import os
#     connector = PiAutoConnector(
#         pi_api_base=os.getenv("PI_API_BASE"),
#         pi_api_key=os.getenv("PI_API_KEY"),
#         openai_api_key=os.getenv("OPENAI_API_KEY"),
#     )
#     asyncio.run(connector.run())
