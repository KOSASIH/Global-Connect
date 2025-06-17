# aiCentralBank/core/stress_tester.py

import random
from typing import Dict, List, Any

class StressTester:
    """
    Simulates and stress-tests the system under extreme macroeconomic or financial shocks.
    """

    def __init__(self: str, state: Dict[str, Any]):
        self.name = name
        self.state = state.copy()
        self.history = []

    def act(self, global_context: Dict[str, Any]) -> Dict[str, Any]:
        # Example: naive agent that randomly tweaks interest rate or reserves
        action = {}
        if random.random() > 0.5:
            action['interest_rate'] = self.state.get('interest_rate', 0.05) + random.uniform(-0.01, 0.01)
        else:
            action['reserve_requirement'] = self.state.get('reserve_requirement', 0.1) MultiAgentSimulator:
    """
    Simulates multiple agents (banks, actors) with their own policy and state.
    """
    def __init__(self, agents: List[CentralBankAgent]):
        self.agents = agents

    def step(self, global_context: Dict[str, Any]):
        actions = {}
        for agent in self.agents:
            actions[agent.name] = agent.act(global_context)
        return actions

    def run(self, steps: int, global_context: Dict[str, Any]):
        for _ in range(steps):
            self.step(global_context)
        return {agent.name: agent.history for agent in self.agents}

# Example usage:
if __name__ == "__main__":
    agents = [
        CentralBankAgent("CentralBankA", {"interest_rate": 0.05, "reserve_requirement": 0.1}),
        CentralBankAgent("BankB", {"interest_rate": 0.04, "reserve_requirement": 0.08})
    ]
    sim = MultiAgentSimulator(agents)
    result = sim.run(5, {})
    print(result)
