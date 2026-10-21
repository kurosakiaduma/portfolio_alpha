from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from models.contact_message import ContactMessage
from db.mongo import insert_document
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["contact"])

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/contact", status_code=status.HTTP_201_CREATED)
async def create_contact_message(request: ContactRequest):
    """Public endpoint to receive contact form submissions."""
    # Create the model to leverage defaults like submitted_at
    new_message = ContactMessage(
        name=request.name,
        email=request.email,
        message=request.message
    )
    
    try:
        # Convert to dictionary and remove id since Mongo assigns _id
        doc = new_message.model_dump(exclude_none=True)
        doc.pop("id", None)
        
        inserted_id = await insert_document("contact_messages", doc)
        return {"id": inserted_id, "message": "Contact message received successfully"}
    except Exception as e:
        logger.exception("Error saving contact message")
        raise HTTPException(status_code=500, detail="Failed to save message")
