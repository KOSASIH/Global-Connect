# aiCentralBank/utils/automated_testing.py

import unittest
from aiCentralBank.core.policy_simulator import PolicySimulator
from aiCentralBank.core.macro_forecast import MacroForecaster
from aiCentralBank.core.digital_currency_manager import DigitalCurrencyManagerunemployment': 0.05
        }
        self.sim = PolicySimulator(self.initial_state)

    def test_interest_rate_policy(self):
        result = self.sim.apply_policy({'interest_rate': 0.03})
        self.assertAlmostEqual(result['interest_rate'], 0.03)

    def test_cbdc_issuance(self):
        result = self.sim.apply_policy({'cbdc_issuance': 10_000_000})
        self.assertEqual(result['cbdc_supply'], 10_000_000)

    def test_macro_forecast(self):
        macro = MacroForecaster()
        forecast = macro.fore environments.**

```python
# aiCentralBank/utils/deploy_orchestrator.py

import subprocess
import sys
import os

class DeployOrchestrator:
    """
    Automates deployment to Docker, Kubernetes, or cloud.
    """

    def docker_build_and_run(self, dockerfile_path="Dockerfile", tag="aicentralbank:latest"):
        print("Building Docker image...")
        subprocess.run(["docker", "build", "-f", dockerfile_path, "-t", tag, "."], check=True)
        print("Running Docker container...")
        subprocess.run(["docker", "run", "-d", "-p", "808```

---

# 23. `config_manager.py`
**Centralized, secure, environment-aware configuration manager for all modules and deployments.**

```python
# aiCentralBank/utils/config_manager.py

import os
import json
from typing import Any, Dict, Optional

class ConfigManager:
    """
    Centralized, environment-aware configuration for aiCentralBank modules.
    Supports .env, JSON, and environment variable overrides.
    """

    def __init__(self, config_path: Optional[str] = None):
        self.config = {}
        if config_path and os.path.exists(config_path):
            with open(config_path, "r")"))
    config.set("API_KEY", "supersecret")
    config.save("aicb_config.json")
