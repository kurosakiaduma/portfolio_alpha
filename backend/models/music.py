from pydantic import BaseModel, Field, model_validator
from typing import Literal, Optional


class MusicEntry(BaseModel):
    id: Optional[str] = Field(default=None)
    title: str = Field(...)
    artist: str = Field(...)
    artwork_url: Optional[str] = None
    audio_url: Optional[str] = None
    youtube_video_id: Optional[str] = None
    source_platform: Literal["spotify", "soundcloud", "youtube", "lastfm", "manual"] = Field(
        default="manual"
    )
    source_url: Optional[str] = None
    playable: bool = Field(default=False)
    display_order: int = Field(default=0)

    @model_validator(mode="after")
    def set_playable_from_youtube(self) -> "MusicEntry":
        # playable is True when a youtube_video_id is present
        if self.youtube_video_id:
            self.playable = True
        return self
