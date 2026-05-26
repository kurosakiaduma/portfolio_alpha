from pydantic import BaseModel, Field, model_validator
from typing import Literal, Optional


class MusicEntry(BaseModel):
    id: Optional[str] = Field(default=None)
    title: str = Field(...)
    artist: str = Field(...)
    artwork_url: Optional[str] = None
    audio_url: Optional[str] = None
    source_platform: Literal["spotify", "soundcloud", "youtube", "lastfm", "manual"] = Field(
        default="manual"
    )
    source_url: Optional[str] = None
    playable: bool = Field(default=False)
    display_order: int = Field(default=0)

    @model_validator(mode="after")
    def audio_required_when_playable(self) -> "MusicEntry":
        if self.playable and not self.audio_url:
            raise ValueError("audio_url is required when playable is True")
        return self
