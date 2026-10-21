from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging
from mcp.agent import ChatbotAgent

logger = logging.getLogger(__name__)
router = APIRouter(tags=["site-agent"])
agent = ChatbotAgent()

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

@router.post("/chatbot")
async def process_chat(request: ChatRequest):
    """Process a chat message via the Site Agent."""
    try:
        response = await agent.chat(request.message, request.history)
        return {"response": response}
    except Exception as e:
        logger.exception("Error in Site Agent response")
        raise HTTPException(status_code=500, detail="Failed to process chat message")
