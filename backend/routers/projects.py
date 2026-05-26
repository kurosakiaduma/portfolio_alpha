from fastapi import APIRouter, HTTPException
from typing import List
from models.project import Project
from db.mongo import get_project_documents, get_document_by_slug

router = APIRouter(prefix="/projects", tags=["projects"])


def _doc_to_project(doc: dict) -> Project:
    return Project(**{**doc, "id": str(doc["_id"])})


@router.get("", response_model=List[Project])
async def list_projects():
    """Return all projects sorted by featured descending, then year descending."""
    docs = await get_project_documents(
        sort=[("featured", -1), ("year", -1)]
    )
    return [_doc_to_project(doc) for doc in docs]


@router.get("/{slug}", response_model=Project)
async def get_project(slug: str):
    """Return a single project by slug."""
    doc = await get_document_by_slug("projects", slug)
    if not doc:
        raise HTTPException(status_code=404, detail="Project not found")
    return _doc_to_project(doc)
