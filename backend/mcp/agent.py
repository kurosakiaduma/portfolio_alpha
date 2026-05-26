"""MCP agent implementation with Ollama support."""
from typing import List, Dict, Any
import json
import httpx
from mcp.config import mcp_settings
from mcp.tools import register_tools

class ChatbotAgent:
    """MCP-powered chatbot agent with Ollama support."""
    
    def __init__(self):
        self.provider = mcp_settings.llm_provider
        self.tools = register_tools()
        self.system_prompt = mcp_settings.system_prompt
        
        if self.provider == "ollama":
            self.ollama_host = mcp_settings.ollama_host
            self.model = mcp_settings.ollama_model
        elif self.provider == "openai":
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=mcp_settings.openai_api_key)
            self.model = mcp_settings.model
    
    async def chat_ollama(self, message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """Process chat using Ollama."""
        if conversation_history is None:
            conversation_history = []
        
        # Build prompt with system message and history
        prompt = f"{self.system_prompt}\n\n"
        for msg in conversation_history:
            role = msg["role"].capitalize()
            prompt += f"{role}: {msg['content']}\n"
        prompt += f"User: {message}\nAssistant:"
        
        # Call Ollama API
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.ollama_host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": mcp_settings.temperature,
                        "num_predict": mcp_settings.max_tokens
                    }
                }
            )
            response.raise_for_status()
            result = response.json()
            return result["response"]
    
    async def chat(self, message: str, conversation_history: List[Dict[str, str]] = None) -> str:
        """
        Process a chat message and return a response.
        
        Args:
            message: User's message
            conversation_history: Previous messages in the conversation
        
        Returns:
            str: Agent's response
        """
        if self.provider == "ollama":
            return await self.chat_ollama(message, conversation_history)
        elif self.provider == "openai":
            return await self.chat_openai(message, conversation_history)
        # Add other providers as needed
    
    async def chat_openai(self, message: str, conversation_history: List[Dict[str, str]] = None):
        """Original OpenAI implementation (kept for fallback)."""
        # ... existing OpenAI code ...
        pass