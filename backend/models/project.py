from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class Project(BaseModel):
    id: Optional[str] = Field(default=None)
    slug: str = Field(...)
    title: str = Field(...)
    description: str = Field(...)
    short_description: str = Field(default="")
    tech: List[str] = Field(default_factory=list)
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    cover_image: Optional[str] = None
    images: List[str] = Field(default_factory=list)
    year: int = Field(...)
    featured: bool = Field(default=False)
    source: Literal["github", "manual"] = Field(default="manual")
    display_order: int = Field(default=0)
