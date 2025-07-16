from fastapi import APIRouter, Depends, Body
from typing import List
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.agent import AgentChatRequest, AgentMessage
from app.services.ai_agent import ai_agent_service

router = APIRouter()

@router.post("/chat")
async def chat_with_agent(
    chat_request: AgentChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Handles a chat interaction with the AI agent.
    """
    response = await ai_agent_service.chat(
        user_id=str(current_user.id),
        messages=chat_request.messages,
        conversation_id=chat_request.conversation_id
    )
    return {"response": response} 