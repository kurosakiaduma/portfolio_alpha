from fastapi import APIRouter
from typing import List
from models.blog import BlogEntry
from db.mongo import get_blog_documents

router = APIRouter(prefix="/blog", tags=["blog"])


def _doc_to_blog(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    # Serialize url and published_date to strings for JSON response
    if "url" in doc and not isinstance(doc["url"], str):
        doc["url"] = str(doc["url"])
    if "published_date" in doc and hasattr(doc["published_date"], "isoformat"):
        doc["published_date"] = doc["published_date"].isoformat()
    return doc


@router.get("", response_model=List[dict])
async def list_blog():
    """Return all blog entries ordered by published_date descending."""
    docs = await get_blog_documents(sort=[("published_date", -1)])
    return [_doc_to_blog(doc) for doc in docs]
