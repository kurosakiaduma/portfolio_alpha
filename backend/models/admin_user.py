"""Pydantic model for admin user documents stored in MongoDB."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class AdminUser(BaseModel):
    email: EmailStr
    password_hash: str
    name: str = "Admin"
    created_at: datetime = None

    def model_post_init(self, __context):
        if self.created_at is None:
            object.__setattr__(self, "created_at", datetime.utcnow())
