from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class ContactMessage(BaseModel):
    id: Optional[str] = None
    name: str
    email: EmailStr
    message: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    reply_text: Optional[str] = None
    replied_at: Optional[datetime] = None
