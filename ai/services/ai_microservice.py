from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os

app = FastAPI(title="Global-Connect AI Microservice")

openai.api_key = os.getenv("OPENAI_API_KEY")

class Product(BaseModel):
    platform: str
    product_id: str
    title: str
    description:"
        f"Description: {product.description}\n"
        f"Price: {product.price}\n"
        f"Stock: {product.stock}\n"
        "Provide sales insights, optimization tips, and compliance checks."
    )
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4",
            messagesFile:** `/ai/services/review_sentiment.py`

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
import os

app = FastAPI(title="Global-Connect Review Analyzer")

openai.api_key = os.getenv("OPENAI_API_KEY")

class Review(BaseModel):
    "Analyze the sentiment (positive/negative/neutral), summarize the review, and flag issues."
    )
    try:
        resp = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=250
        )
        result = resp['choices'][0][' detail=str(e))
    return {"sentiment_analysis": result, "product_id": review.product_id}
