from fastapi import FastAPI, Request
import openai

app = FastAPI()
openai.api_key = "YOUR_KEY"

@app.post("/ask")
async def ask_ai(request: Request):
    data = await request.json()
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": data.get("query", "")}]
    )
    return {"answer": response.choices[0].message.content}
