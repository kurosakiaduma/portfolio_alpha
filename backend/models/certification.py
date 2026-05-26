from pydantic import BaseModel, Field
from typing import Literal, Optional

class Certification(BaseModel):
    id: Optional[str] = Field(default=None)
    title: str = Field(...)
    issuer: str = Field(...)
    year: int = Field(...)
    icon: str = Field(...)
    grid_size: Literal["1x1", "2x1"] = Field(default="2x1")
    is_academic: bool = Field(default=True)
    display_order: int = Field(default=0)
    icon_type: Literal["brand", "custom"] = Field(default="custom")
    skill_type: Literal["certificate", "degree"] = Field(default="certificate")