from pydantic import BaseModel, Field
from typing import Literal, Optional

class Skill(BaseModel):
    id: Optional[str] = Field(default=None)
    name: str = Field(...)
    icon: str = Field(...)
    category: str = Field(...)
    description: str = Field(default="")
    grid_size: Literal["1x1", "2x1", "2x2"] = Field(default="1x1")
    is_academic: bool = Field(default=False)
    display_order: int = Field(default=0)
    icon_type: Literal["brand", "custom", "degree"] = Field(default="brand")
    skill_type: Literal["skill", "certificate", "degree"] = Field(default="skill")