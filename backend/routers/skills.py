from fastapi import APIRouter
from typing import List
from models.skill import Skill
from db.mongo import get_skill_documents

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("", response_model=List[Skill])
async def list_skills():
    docs = await get_skill_documents()
    return [Skill(**{**doc, "id": str(doc["_id"])}) for doc in docs]