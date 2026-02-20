from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.ai_service import get_ai_finance_advice
from app.models.history import ChatHistory
from pydantic import BaseModel

router = APIRouter()

# Schema for the incoming request
class ChatRequest(BaseModel):
    query: str
    email: str  # Added email to the schema so the frontend can send it

@router.post("/chat")
async def chat_with_ai(
    request: ChatRequest, 
    db: Session = Depends(get_db)
):
    # 1. Capture Identity
    # We now pull the email directly from the frontend request body
    user_email = request.email.lower()
    
    if not user_email or user_email == "guest@financepro.ai":
        # Fallback to avoid identity errors for new users
        user_email = "abhijitsahoo2024@gift.edu.in" 

    # 2. Get Advanced Advice
    # This calls our Ollama/Llama 3.2 logic in ai_service.py
    advice_content = get_ai_finance_advice(db, user_email, request.query)
    
    # 3. Persistence Logic (Error-Resistant)
    try:
        new_chat = ChatHistory(
            user_email=user_email,
            query=request.query,
            response=advice_content
        )
        db.add(new_chat)
        db.commit()
    except Exception as db_err:
        # If database fails to save, we still return the AI response 
        # so the user doesn't see a crash.
        print(f"⚠️ History Save Failed: {db_err}")
        db.rollback()
    
    return {"response": advice_content}