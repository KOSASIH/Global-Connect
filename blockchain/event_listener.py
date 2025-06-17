# global_connect/blockchain/event_listener.py

import threading
import time
from typing import Callable, Any, Optional

class EventListener:
    """
    Real-time event listener for contract events or new blocks.
    """

    def __init__(self, web3_instance):
        self.web3 = web3_instance
        self.running = False

    def listen_for_event(self, contract, event_name: str, callback: Callable[[Any], None], poll_interval: float = 2.0):
        event_filter = getattr(contract.events, event_name).createFilter(fromBlock='latest')
        def poll():
            while self.running:
                for event in event_filter.get_new_entries():
                    callback(event)
                time.sleep(poll_interval)
        self.running = True
        threading.Thread(target=poll, daemon=True).start()

    def stop(self):
        self.running = False
