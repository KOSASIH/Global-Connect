# apps/ai/pi_partner_autonomous_ai/feedback_loop.py

import json
import logging
from typing import Dict, Any, Optional

from .ai_provider import AIProvider

logger = logging.getLogger("FeedbackLoopAI")

class FeedbackLoopAI:
 \"update\": \"...\", \"reason\": \"...\"}"
        )
        try:
            response = self.ai.chat(prompt)
            result = json.loads(response)
            logger.info(f"FeedbackLoopAI result: {result}")
            return result
        except Exception as e:
            logger.error(f"FeedbackLoopAI error: {e}")
            return {
                "change_needed": False,
                "update": "",
                "reason": f"AI error: {e}"
            }
