from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.models.user import User
from app.services.ai_agent import ai_agent_service
from app.core.config import settings

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None
    tool_outputs: Optional[List] = None

@router.get("/health")
async def ai_agent_health_check():
    """Check if AI agent is properly configured and available."""
    try:
        # Check if Google API key is configured
        if not settings.google_api_key:
            return {
                "status": "error",
                "message": "Google API key not configured",
                "available": False
            }
        
        # Check if the AI service is initialized
        if not ai_agent_service.model:
            return {
                "status": "error", 
                "message": "AI model not initialized",
                "available": False
            }
        
        return {
            "status": "ok",
            "message": "AI agent is available",
            "available": True,
            "model": "gemini-1.5-flash"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"AI agent health check failed: {str(e)}",
            "available": False
        }

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Handles a chat interaction with the AI agent.
    """
    try:
        # Process the message with the AI agent
        result = await ai_agent_service.process_message(
            user_id=str(current_user.id),
            message=request.message,
            conversation_id=request.conversation_id
        )
        
        return ChatResponse(
            response=result.get("response", "I'm sorry, I couldn't process your request."),
            conversation_id=result.get("conversation_id"),
            tool_outputs=result.get("tool_outputs", [])
        )
    except Exception as e:
        print(f"AI Agent error: {e}")
        raise HTTPException(
            status_code=500,
            detail="AI agent temporarily unavailable. Please try again later."
        ) 