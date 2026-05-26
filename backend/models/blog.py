from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import date


class BlogEntry(BaseModel):
    id: Optional[str] = Field(default=None)
    title: str = Field(...)
    url: HttpUrl = Field(...)
    source_name: str = Field(...)
    excerpt: str = Field(default="")
    published_date: date = Field(...)
    tags: List[str] = Field(default_factory=list)
    is_own: bool = Field(default=False)
    display_order: int = Field(default=0)
