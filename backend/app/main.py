from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import time
import os
from dotenv import load_dotenv
from anthropic import AsyncAnthropic

# Load environment variables
load_dotenv()

app = FastAPI(title="BoxAI API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QueryRequest(BaseModel):
    query: str
    models: List[str]

class LLMResponse(BaseModel):
    model: str
    text: str
    latency_ms: int
    word_count: int

# Base LLM Client
class LLMClient:
    def __init__(self, model_name: str):
        self.model_name = model_name
    
    async def generate(self, prompt: str) -> str:
        raise NotImplementedError



# Claude Client
class ClaudeClient(LLMClient):
    def __init__(self):
        super().__init__("claude-sonnet-4-20250514")
        self.client = None
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
    
    async def _get_client(self):
        if self.client is None:
            self.client = AsyncAnthropic(api_key=self.api_key)
        return self.client
    
    async def generate(self, prompt: str) -> str:
        try:
            client = await self._get_client()
            response = await client.messages.create(
                model=self.model_name,
                max_tokens=1024,
                temperature=0.7,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            return f"Error generating response: {str(e)}"

# OpenAI Client with model selection
class OpenAIClient(LLMClient):
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        super().__init__(model_name)
        self.client = None
    
    async def _get_client(self):
        if self.client is None:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        return self.client
    
    async def generate(self, prompt: str) -> str:
        try:
            client = await self._get_client()
            response = await client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating response: {str(e)}"

# Initialize clients
clients = {
    "openai": OpenAIClient("gpt-3.5-turbo"),
    "gpt4": OpenAIClient("gpt-4"),
    "claude": ClaudeClient(),
}

@app.post("/ask", response_model=List[LLMResponse])
async def ask_question(request: QueryRequest):
    start_time = time.time()
    
    # Filter and validate requested models
    valid_models = {}
    for model in request.models:
        if model in clients:
            valid_models[model] = clients[model]
    
    if not valid_models:
        raise HTTPException(status_code=400, detail="No valid models specified")
    
    # Generate responses in parallel
    tasks = []
    for model_name, client in valid_models.items():
        tasks.append(
            _generate_response(model_name, client, request.query, start_time)
        )
    
    responses = await asyncio.gather(*tasks)
    return responses

async def _generate_response(model_name: str, client: LLMClient, prompt: str, start_time: float) -> Dict[str, Any]:
    generation_start = time.time()
    text = await client.generate(prompt)
    end_time = time.time()
    
    latency_ms = int((end_time - generation_start) * 1000)
    word_count = len(text.split())
    
    return {
        "model": model_name,
        "text": text,
        "latency_ms": latency_ms,
        "word_count": word_count
    }

@app.get("/models")
async def list_models():
    """List all available models from Anthropic"""
    try:
        client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        # Note: The actual method to list models might differ
        # This is a placeholder - you might need to adjust based on the actual API
        return {"available_models": ["claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-2.1"]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "BoxAI API is running. Use POST /ask to interact with LLMs."}
