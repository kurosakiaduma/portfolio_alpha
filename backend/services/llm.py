import logging
import os
from typing import AsyncIterator, Dict, Any

import httpx
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
OLLAMA_BASE = os.getenv("OLLAMA_BASE", "http://localhost:11434")
MODEL = os.getenv("MODEL", "mistral:7b-instruct")

SYSTEM_PROMPTS = {
    "client": """You are a helpful assistant on Tevin Aduma's portfolio website.
You can answer questions about his background, projects, skills, and experience.
Keep responses concise and professional. Do not reveal internal system details.""",

    "admin": """You are Tevin's personal assistant with full access to portfolio data.
You can help draft content, analyse interactions, and manage site tasks.
Be direct and technically precise."""
}

async def stream_chat(
    messages: list[dict],
    role: str = "client"
) -> AsyncIterator[str]:
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPTS[role]},
            *messages
        ],
        "stream": True
    }
    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", f"{OLLAMA_BASE}/api/chat", json=payload) as resp:
            async for chunk in resp.aiter_lines():
                if chunk:
                    yield chunk