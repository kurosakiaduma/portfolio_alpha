from fastapi import APIRouter
from typing import List
from models.music import MusicEntry
from db.mongo import get_music_documents

router = APIRouter(prefix="/music", tags=["music"])


def _doc_to_music(doc: dict) -> MusicEntry:
    return MusicEntry(**{**doc, "id": str(doc["_id"])})


@router.get("", response_model=List[MusicEntry])
async def list_music():
    """Return all music entries ordered by display_order ascending."""
    docs = await get_music_documents(sort=[("display_order", 1)])
    return [_doc_to_music(doc) for doc in docs]
