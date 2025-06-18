# global_connect/ai/ai_chatbot.py

import openai

class AIChatBot:
    """
    Conversational AI for blockchain support, code, and automation.
    """

    def __init__(self, api_key: str, model: str = "gpt-4"):
        openai.api_key = api_key
        self.model = model

    def chat(self, user_message: str, context: str = "") -> str:
        prompt = (
            "You are an advanced blockchain assistant AI for the Global-Connect platform. "
            "You can answer questions, write code, explain transactions, monitor health, and automate actions."
            f"\nContext: {context}\n"
            f"User: {user_message}\nAI:"
        )
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[{"role": "system", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
