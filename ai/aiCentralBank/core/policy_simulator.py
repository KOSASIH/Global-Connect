# aiCentralBank/core/policy_simulator.py

import numpy as np
import pandas as pd
from typing import Dict, List, Any
from .macro_forecast import MacroForecaster
from .digital_currency_manager import DigitalCurrencyManager

class PolicySimulator:
    """
    Simulates the effect of monetary and fiscal policies on macroeconomic indicators.
    """

    def __init__(self, initial_state: Dict, macro_model: MacroForecaster = None, cbdc_engine: DigitalCurrencyManager = None):
        self.state = initial_state.copy()
        self.history = []
        self.macro_model = macro_model or MacroForecaster()
        self.cbdc_engine = cbdc_engine or DigitalCurrencyManager()
        self._log("PolicySimulator initialized.")

    def _log(self, msg: str):
        print(f"[PolicySimulator] {msg}")

    def apply_policy(self, policy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply a policy and update the state.
        Supported keys: 'interest_rate', 'reserve_requirement', 'qe', 'qt', 'fiscal_stimulus', 'cbdc_issuance'
        """
        self._log(f"Applying policy: {policy}")
        # Interest Rate
        if 'interest_rate' in policy:
            self.state['interest_rate'] = policy['interest_rate']

        # Reserve Requirement
        if 'reserve_requirement' in policy:
            self.state['reserve_requirement'] = policy['reserve_requirement']

        # Quantitative Easing or Tightening
        if 'qe' in policy:
            self.state['central_bank_assets'] += policy['qe']
        if 'qt' in policy:
            self.state['central_bank_assets'] -= policy['qt']

        # Fiscal Stimulus
        if 'fiscal_stimulus' in policy:
            self.state['gov_spending'] += policy['fiscal_stimulus']

        # CBDC Issuance
        if 'cbdc_issuance' in policy:
            self.cbdc_engine.issue(policy['cbdc_issuance'])
            self.state['cbdc_supply'] += policy['cbdc_issuance']

        # Update macro model
        forecast = self.macro_model.forecast(self.state, policy)
        self.state.update(forecast)
        self.history.append({'policy': policy, 'result': self.state.copy()})
        self._log(f"New state: {self.state}")
        return self.state

    def simulate_scenario(self, policy_sequence: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run a sequence of policies and return the timeline of states.
        """
        timeline = [self.state.copy()]
        for policy in policy_sequence:
            self.apply_policy(policy)
            timeline.append(self.state.copy())
        return timeline

    def reset(self, initial_state: Dict = None):
        self.state = initial_state.copy() if initial_state else self.history[0]['result'].copy()
        self.history = []
        self._log("Simulator reset.")

    def get_history(self) -> List[Dict]:
        return self.history

    def explain_last_action(self) -> str:
        if not self.history:
            return "No policy actions taken yet."
        last = self.history[-1]
        # Use LLM for explanation (placeholder)
        return f"Applied policy {last['policy']}, resulting in state {last['result']}."


# Example usage:
if __name__ == '__main__':
    initial_state = {
        'interest_rate': 0.05,
        'reserve_requirement': 0.1,
        'central_bank_assets': 1_000_000_000,
        'gov_spending': 500_000_000,
        'cbdc_supply': 0,
        'gdp': 1_000_000_000,
        'inflation': 0.02,
        'unemployment': 0.05
    }
    sim = PolicySimulator(initial_state)
    sim.apply_policy({'interest_rate': 0.03, 'qe': 1_000_000, 'cbdc_issuance': 10_000_000})
    print(sim.get_history())
