from __future__ import annotations
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings


load_dotenv()

class MCPSettings(BaseSettings):
    """Settings for the MCP chatbot."""
    
    # Ollama Configuration
    llm_provider: str = os.getenv("MCP_LLM_PROVIDER", "ollama")  # "openai" | "anthropic" | "ollama"
    ollama_host: str = os.getenv("MCP_OLLA_HOST", "http://localhost:11434")  # Or EC2 private IP
    ollama_model: str = os.getenv("MCP_OLLA_MODEL", "llama3.1:8b-instruct-q4_K_M")


    # Model parameters
    max_tokens: int = int(os.getenv("MCP_MAX_TOKENS", 512))
    model: str = os.getenv("MCP_MODEL", "gpt-4o")
    temperature: float = float(os.getenv("MCP_TEMPERATURE", 0.7))
    system_prompt: str = """You are a helpful assistant for a portfolio website. 
    You help visitors learn about the portfolio owner's skills, projects, and background.
    Be concise, friendly, and professional. Use the available tools to fetch accurate information."""
    
    class Config:
        env_file = "local.env"
        env_prefix = "MCP_"

mcp_settings = MCPSettings()
