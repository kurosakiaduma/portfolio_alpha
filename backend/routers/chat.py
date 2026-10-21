import httpx
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.llm import OLLAMA_BASE, stream_chat
from services.auth import verify_admin_token

router = APIRouter()

class ChatRequest(BaseModel):
    messages: list[dict]
    session_id: str | None = None

@router.post("/chat/client")
async def client_chat(req: ChatRequest):
    return StreamingResponse(
        stream_chat(req.messages, role="client"),
        media_type="text/event-stream"
    )

@router.post("/chat/admin")
async def admin_chat(req: ChatRequest, _: None = Depends(verify_admin_token)):
    return StreamingResponse(
        stream_chat(req.messages, role="admin"),
        media_type="text/event-stream"
    )

@router.get("/metrics/llm")
async def llm_metrics(_: None = Depends(verify_admin_token)):
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(f"{OLLAMA_BASE}/metrics")
        return Response(content=resp.text, media_type="text/plain")