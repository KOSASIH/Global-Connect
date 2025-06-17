# aiCentralBank/core/liquidity_optimizer.py

import numpy as np

class LiquidityOptimizer:
    """
    Reinforcement learning-based optimizer for central bank liquidity and reserves.
    """

    def __init__(self, initial_reserves: float, target_liquidity: float):
        self.reserves = initial_reserves
        self.target = target_liquidity
        self.history = []
        self.actions = ["increase", "decrease", "hold"]
        self.learning_rate = 0.1
        self.q_table = {a: 0.0 for a in self.actions}

    def _reward(self, liquidity):
        # Reward is highest when liquidity is close to target, penalize overshoot/undershoot
        return -abs(liquidity - self.target)

    def decide(self, current_liquidity: float) -> str:
        # Simple epsilon-greedy action selection
        if np.random.rand() < 0.1:
            action = np.random.choice(self.actions)
        else:
            action = max(self.q_table, key=self.q_table.get)
        return action

    def step(self, current_liquidity: float):
        action = self.decide(current_liquidity)
        if action == "increase":
            self.reserves += 1_000_000
        elif action == "decrease":
            self.reserves = max(0, self.reserves - 1_000_000)
        # else "hold": do nothing

        reward = self._reward(current_liquidity)
        self.q_table[action] += self.learning_rate * (reward - self.q_table[action])
        self.history.append({"liquidity": current_liquidity, "action": action, "reward": reward})

        return action, self.reserves

    def optimize(self, liquidity_series):
        results = []
        for liquidity in liquidity_series:
            action, reserves = self.step(liquidity)
            results.append({"liquidity": liquidity, "action": action, "reserves": reserves})
        return results

    def get_q_table(self):
        return self.q_table.copy()

    def get_history(self):
        return self.history.copy()

# Example usage:
if __name__ == "__main__":
    optimizer = LiquidityOptimizer(initial_reserves=1_000_000_000, target_liquidity=900_000_000)
    liquidity_series = [920_000_000, 880_000_000, 910_000_000, 950_000_000]
    results = optimizer.optimize(liquidity_series)
    print("Optimization Results:", results)
    print("Q-table:", optimizer.get_q_table())
