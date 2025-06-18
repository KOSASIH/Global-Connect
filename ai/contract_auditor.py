# global_connect/ai/contract_auditor.py

import openai

class SmartContractAuditor:
    """
    Uses an LLM (e.g. GPT-4) to audit smart contracts for vulnerabilities and best practices.
    """

    def __init__(self, api_key: str, model: str = "gpt-4"):
        openai.api_key = api_key
        self.model = model

    def audit(self, contract_code: str) -> str:
        prompt = (
            "You are a world-class smart contract auditor. "
            "Audit the following Solidity code for vulnerabilities, security issues, and best practices. "
            "Structure your findings in sections: Critical, Warning, Best Practice, Suggestions."
            "\n\n[BEGIN CONTRACT]\n"
            f"{contract_code}\n"
            "[END CONTRACT]\n"
        )
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "system", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
