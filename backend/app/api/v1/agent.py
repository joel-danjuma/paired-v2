from fastapi import APIRouter, Depends
from typing import List
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.conversation import Message
from app.services.ai_agent import ai_agent_service

router = APIRouter()

@router.post("/chat")
async def chat_with_agent(
    messages: List[Message],
    current_user: User = Depends(get_current_user)
):
    """
    Handles a chat interaction with the AI agent.
    """
    response = await ai_agent_service.chat(messages)
    return {"response": response} 