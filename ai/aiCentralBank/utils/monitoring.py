# aiCentralBank/utils/monitoring.py

import time
import threading
from typing import Dict, Callable, List, Any

class MonitoringAgent:
    """
    Monitors system health, AI inference latency, resource usage, and critical events.
    Supports custom hooks for alerting and dashboards.
    """

    def __init__(self, check_interval: float = 5.0):
        self.metrics: Dict[str, List[float]] = {}
        self.event_hooks: List[Callable[[str, Any], None]] = []
        self.running = False
        self.check_interval = check_interval

    def record_metric(self, name: str, value: float):
        if name not in self.metrics:
            self.metrics[name] = []
        self.metrics[name].append(value)

    def add_event_hook(self, hook: Callable[[str, Any], None]):
        self.event_hooks.append(hook)

    def trigger_event(self, event_name: str, payload: Any):
        for hook in self.event_hooks:
            hook(event_name, payload)

    def monitor_loop(self):
        self.running = True
        while self.running:
            # Example: Monitor dummy CPU and AI inference time
            import random
            cpu = random.uniform(10, 90)
            ai_latency = random.uniform(0.05, 1.5)
            self.record_metric('cpu', cpu)
            self.record_metric('ai_latency', ai_latency)
            if cpu > 80:
                self.trigger_event("high_cpu", cpu)
            if ai_latency > 1.0:
                self.trigger_event("slow_inference", ai_latency)
            time.sleep(self.check_interval)

    def start(self):
        threading.Thread(target=self.monitor_loop, daemon=True).start()

    def stop(self):
        self.running = False

    def get_metrics(self) -> Dict[str, List[float]]:
        return self.metrics

# Example usage:
if __name__ == "__main__":
    def alert(event, payload):
        print(f"ALERT: {event} - {payload}")
    agent = MonitoringAgent()
    agent.add_event_hook(alert)
    agent.start()
    time.sleep(12)
    agent.stop()
    print(agent.get_metrics())
