# sdk/python/globalconnect.py

import os
import requests
import logging
import time
from typing import Any, Dict, List, Optional, Callable, Union

try:
    import aiohttp
except ImportError:
    aiohttp = None  # Async support is optional

# Configure logging
logger = logging.getLogger("GlobalConnect")
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s:%(name)s: %(message)s"))
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


class GlobalConnectError(Exception):
    """Custom exception for GlobalConnect SDK errors."""


class GlobalConnect:
    def __init__(
        self,
        api_key: Optional[str] = None,
        api_base: Optional[str] = None,
        timeout: int = 10,
        max_retries: int = 3,
        backoff_factor: float = 0.5,
        debug: bool = False
    ):
        self.api_key = api_key or os.getenv("GLOBALCONNECT_API_KEY")
        self.api_base = api_base or os.getenv("GLOBALCONNECT_API_BASE") or "http://localhost:3000"
        self.timeout = timeout
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

        if debug:
            logger.setLevel(logging.DEBUG)
        if not self.api_key:
            logger.error("API key is required.")
            raise GlobalConnectError("API key is required.")

        self.headers = {"Authorization": f"Bearer {self.api_key}"}
        logger.debug(f"Initialized GlobalConnect with base: {self.api_base}")

    def _request(
        self,
        method: str,
        endpoint: str,
        *,
        json: Optional[Dict] = None,
        params: Optional[Dict] = None,
        retries: Optional[int] = None,
        **kwargs
    ) -> Any:
        url = f"{self.api_base}{endpoint}"
        attempts = retries if retries is not None else self.max_retries
        for attempt in range(1, attempts + 1):
            try:
                logger.debug(f"Request {method} {url} attempt {attempt}")
                response = requests.request(
                    method,
                    url,
                    headers=self.headers,
                    json=json,
                    params=params,
                    timeout=self.timeout,
                    **kwargs
                )
                response.raise_for_status()
                logger.debug(f"Response: {response.status_code} {response.text[:300]}")
                if response.content:
                    return response.json()
                return None
            except requests.RequestException as e:
                logger.warning(f"Request failed: {e}")
                if attempt < attempts:
                    sleep_time = self.backoff_factor * (2 ** (attempt - 1))
                    logger.info(f"Retrying in {sleep_time:.2f}s...")
                    time.sleep(sleep_time)
                else:
                    logger.error(f"Request failed after {attempt} attempts")
                    raise GlobalConnectError(f"HTTP error: {e}")

    # --------- Partner APIs ---------
    def get_status(self) -> Dict:
        """Get partner integration status"""
        return self._request("GET", "/partners/status")

    def trigger_event(self, event: str, data: Dict) -> Dict:
        """Trigger a custom event"""
        return self._request("POST", f"/events/{event}", json=data)

    def register_webhook(self, events: List[str], url: str) -> Dict:
        """Register a webhook for partner events"""
        return self._request("POST", "/webhooks/register", json={"events": events, "url": url})

    def get_analytics(self) -> Dict:
        """Get analytics for partner"""
        return self._request("GET", "/partners/analytics")

    def get_compliance(self) -> Dict:
        """Get compliance status (if available)"""
        return self._request("GET", "/partners/compliance")

    def get_recommendations(self) -> Dict:
        """Get AI-powered partner recommendations (if available)"""
        return self._request("GET", "/partners/recommendations")

    def custom_endpoint(self, method: str, endpoint: str, **kwargs) -> Any:
        """Call a custom endpoint (advanced/extensible)"""
        return self._request(method, endpoint, **kwargs)

    # --------- Webhook/Event Helpers ---------
    def listen_webhook(
        self,
        events: List[str],
        handler: Callable[[Dict], None],
        host: str = "0.0.0.0",
        port: int = 8080,
        path: str = "/webhook",
        secret: Optional[str] = None
    ):
        """
        Start a local Flask webhook listener.
        Usage: gc.listen_webhook(["event"], handler)
        """
        try:
            from flask import Flask, request, abort
        except ImportError:
            raise ImportError("Please install Flask to use webhook listener: pip install flask")
        app = Flask(__name__)

        @app.route(path, methods=["POST"])
        def _webhook():
            if secret and request.headers.get("X-GC-Secret") != secret:
                abort(401)
            payload = request.json
            logger.info(f"Received webhook: {payload}")
            if payload and payload.get("event") in events:
                handler(payload)
            return "", 204

        logger.info(f"Listening for webhooks on {host}:{port}{path} for events: {events}")
        app.run(host=host, port=port)

    # --------- Async Support (optional) ---------
    async def async_request(
        self,
        method: str,
        endpoint: str,
        *,
        json: Optional[Dict] = None,
        params: Optional[Dict] = None,
        **kwargs
    ) -> Any:
        if aiohttp is None:
            raise ImportError("aiohttp is required for async support: pip install aiohttp")
        url = f"{self.api_base}{endpoint}"
        headers = self.headers.copy()
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method,
                url,
                headers=headers,
                json=json,
                params=params,
                timeout=self.timeout,
                **kwargs
            ) as resp:
                if resp.status >= 400:
                    text = await resp.text()
                    logger.error(f"Async HTTP error {resp.status}: {text}")
                    raise GlobalConnectError(f"Async HTTP error {resp.status}: {text}")
                logger.debug(f"Async response: {resp.status}")
                if resp.content_type == 'application/json':
                    return await resp.json()
                return await resp.text()

    async def async_get_status(self) -> Dict:
        """Async: Get partner integration status"""
        return await self.async_request("GET", "/partners/status")

    # --------- Advanced Features ---------
    def set_debug(self, enabled: bool = True):
        """Enable or disable debug logging for SDK."""
        logger.setLevel(logging.DEBUG if enabled else logging.INFO)

    def set_api_key(self, api_key: str):
        """Change API key at runtime"""
        self.api_key = api_key
        self.headers["Authorization"] = f"Bearer {api_key}"


# --------- Example Usage ---------
if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.DEBUG)
    key = os.getenv("GLOBALCONNECT_API_KEY") or "YOUR_API_KEY"
    gc = GlobalConnect(api_key=key, debug=True)

    try:
        print("Partner status:", gc.get_status())
        print("Analytics:", gc.get_analytics())
        print("Compliance:", gc.get_compliance())
        print("Recommendations:", gc.get_recommendations())
        print("Register webhook:", gc.register_webhook(["onboarding", "error"], "https://your.site/webhook"))
    except GlobalConnectError as e:
        logger.error(f"SDK error: {e}")

    # To use async methods:
    # import asyncio
    # asyncio.run(gc.async_get_status())

    # To run a webhook listener:
    # def handler(payload):
    #     print("Got webhook!", payload)
    # gc.listen_webhook(["onboarding"], handler)
