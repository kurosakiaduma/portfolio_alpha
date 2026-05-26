from fastapi import APIRouter
from typing import List
from models.certification import Certification
from db.mongo import get_certification_documents

router = APIRouter(prefix="/certifications", tags=["certifications"])

@router.get("", response_model=List[Certification])
async def list_certifications():
    docs = await get_certification_documents()
    return [Certification(**{**doc, "id": str(doc["_id"])}) for doc in docs]