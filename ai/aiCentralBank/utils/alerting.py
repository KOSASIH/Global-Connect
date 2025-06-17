# aiCentralBank/utils/alerting.py

from typing import List, Dict, Any, Callable
import datetime

class AlertingSystem:
    """
    Flexible alerting for compliance, operational, or AI-detected anomalies.
    Supports integration with email, Slack, PagerDuty, SMS, etc.
    """

    def __init__(self):
        self.rules: List[Callable[[Dict[str, Any]], bool]] = []
        self.alert_handlers: List[Callable[[str, Dict[str, Any]], None]] = []

    def add_rule(self, rule_func: Callable[[Dict[str, Any]], bool]):
        self.rules.append(rule_func)

    def add_alert_handler(self, handler: Callable[[str, Dict[str, Any]], None]):
        self.alert_handlers.append(handler)

    def check_and_alert(self, event: Dict[str, Any]):
        for rule in self.rules:
            if rule(event):
                self.send_alert("ALERT", event)

    def send_alert(self, message: str, event: Dict[str, Any]):
        for handler in self.alert_handlers:
            handler(message, event)

# Example usage:
if __name__ == "__main__":
    def print_alert(msg, event):
        print(f"{datetime.datetime.now()} {msg}: {event}")

    alert_sys = AlertingSystem()
    alert_sys.add_rule(lambda e: e.get('type') == 'compliance_breach')
    alert_sys.add_alert_handler(print_alert)
    alert_sys.check_and_alert({'type': 'compliance_breach', 'detail': 'AML flag triggered'})
