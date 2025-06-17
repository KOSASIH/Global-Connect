# aiCentralBank/utils/secrets_manager.py

import os
import base64
import json
from cryptography.fernet import Fernet
from typing import Optional, Dict

class SecretsManager:
    """
    Encrypted, centralized secrets vault for API keys, credentials, and tokens.
    """

    def __init__(self, key_env_var: str = "AICB_SECRETS_KEY"):
        key = os.getenv(key_env_var)
        if not key:
            # Generate and save a key if not present
            key = base64.urlsafe_b64encode(Fernet.generate_key()).decode()
            print(f"Generated new secrets key: {key} (store securely and set as {key_env_var})")
        self.fernet = Fernet(key.encode())
        self.secrets: Dict[str, str] = {}

    def set_secret(self, name: str, value: str):
        enc = self.fernet.encrypt(value.encode())
        self.secrets[name] = base64.urlsafe_b64encode(enc).decode()

    def get_secret(self, name: str) -> Optional[str]:
        enc = self.secrets.get(name)
        if not enc:
            return None
        try:
            return self.fernet.decrypt(base64.urlsafe_b64decode(enc.encode())).decode()
        except Exception:
            return None

    def save(self, path: str):
        with open(path, "w") as f:
            json.dump(self.secrets, f, indent=2)

    def load(self, path: str):
        with open(path, "r") as f:
            self.secrets = json.load(f)

# Example usage:
if __name__ == "__main__":
    sm = SecretsManager()
    sm.set_secret("API_KEY", "super_secret_value123")
    print("Decrypted:", sm.get_secret("API_KEY"))
    sm.save("vault.json")
    sm.load("vault.json")
    print("Loaded:", sm.get_secret("API_KEY"))
