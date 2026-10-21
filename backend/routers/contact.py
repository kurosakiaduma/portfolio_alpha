"""Public contact form endpoint with IP-based rate limiting."""

import time
import logging
from typing import Dict

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr

from db.mongo import insert_document
from models.contact_message import ContactMessage

logger = logging.getLogger(__name__)
router = APIRouter(tags=["contact"])

# ---------------------------------------------------------------------------
# Rate limiter: 5 submissions per IP per hour
# ---------------------------------------------------------------------------
_contact_attempts: Dict[str, Dict[str, float]] = {}

CONTACT_MAX = 5
CONTACT_WINDOW = 3600  # 1 hour in seconds


def _check_contact_rate_limit(ip: str) -> None:
    """Raise 429 if this IP has exceeded the contact submission limit."""
    now = time.time()
    entry = _contact_attempts.get(ip)

    if entry:
        # Reset window if expired
        if now - entry["window_start"] > CONTACT_WINDOW:
            _contact_attempts.pop(ip, None)
        elif entry["count"] >= CONTACT_MAX:
            retry_after = int(CONTACT_WINDOW - (now - entry["window_start"]))
            raise HTTPException(
                status_code=429,
                detail="Too many messages. Please try again later.",
                headers={"Retry-After": str(retry_after)},
            )


def _record_contact_attempt(ip: str) -> None:
    now = time.time()
    entry = _contact_attempts.setdefault(ip, {"count": 0, "window_start": now})
    if now - entry["window_start"] > CONTACT_WINDOW:
        entry["count"] = 0
        entry["window_start"] = now
    entry["count"] += 1


# ---------------------------------------------------------------------------
# Request schema
# ---------------------------------------------------------------------------

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/contact", status_code=201)
async def submit_contact(request: Request, body: ContactRequest):
    """Accept a contact form submission and persist it to MongoDB."""
    ip = request.client.host if request.client else "unknown"
    _check_contact_rate_limit(ip)

    msg = ContactMessage(
        name=body.name.strip(),
        email=body.email,
        message=body.message.strip(),
    )

    doc = msg.model_dump(exclude={"id"})
    new_id = await insert_document("contact_messages", doc)
    _record_contact_attempt(ip)

    logger.info("Contact message saved id=%s from ip=%s", new_id, ip)
    return {"id": new_id, "status": "received"}
