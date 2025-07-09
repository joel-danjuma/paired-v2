from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from app.models.database import get_db_session
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.core.deps import get_current_user
from app.schemas.conversation import ChatMessage, ConversationCreate
from app.services.ai_agent import ai_agent_service
from app.services.ai_enhanced import enhanced_ai_service
from app.services.langgraph import langgraph_service

router = APIRouter()

@router.get("/")
async def get_agent_info():
    """Get AI agent info - placeholder"""
    return {"message": "AI Agent endpoint - coming soon"}

@router.post("/query/{thread_id}", response_model=AgentResponse)
async def process_agent_query(
    thread_id: str,
    query_data: AgentQuery
):
    """Process a natural language query using the AI agent workflow"""
    try:
        result = await langgraph_service.run_workflow(query_data.query, thread_id)
        
        # Format the response
        preferences = result['preferences']
        final_matches = result['final_matches']
        
        response_text = f"I found {len(final_matches)} potential matches based on your preferences."
        
        return AgentResponse(
            preferences=preferences,
            original_query=query_data.query,
            response_text=response_text
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing your query: {e}"
        )

@router.post("/query", response_model=AgentResponse)
async def process_new_agent_query(
    query_data: AgentQuery
):
    """Start a new conversation and process a query"""
    thread_id = str(uuid.uuid4())
    return await process_agent_query(thread_id, query_data)

@router.post("/chat")
async def chat_with_agent(
    message: ChatMessage,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Enhanced chat with AI agent including personality analysis and context awareness."""
    
    try:
        # Get or create conversation
        result = await db.execute(
            select(Conversation).where(
                Conversation.participants.contains([str(current_user.id)]) &
                Conversation.conversation_type == "ai_agent"
            )
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            conversation = Conversation(
                participants=[str(current_user.id)],
                conversation_type="ai_agent",
                metadata={"agent_type": "enhanced"}
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)
        
        # Get conversation history for context
        history_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(20)
        )
        history_messages = history_result.scalars().all()
        
        # Prepare conversation data for AI
        conversation_data = []
        for msg in reversed(history_messages):
            conversation_data.append({
                "type": "message",
                "sender": "user" if msg.sender_id == str(current_user.id) else "agent",
                "content": msg.content,
                "timestamp": msg.created_at.isoformat()
            })
        
        # Update conversation context
        context = await enhanced_ai_service.update_conversation_context(
            str(current_user.id), 
            message.content, 
            conversation_data
        )
        
        # Check for user frustration
        recent_user_messages = [
            msg.content for msg in history_messages[-5:] 
            if msg.sender_id == str(current_user.id)
        ]
        frustration_analysis = await enhanced_ai_service.detect_user_frustration(
            str(current_user.id), 
            recent_user_messages + [message.content]
        )
        
        # Generate enhanced response
        if frustration_analysis["is_frustrated"]:
            # Use empathetic response for frustrated users
            ai_response = await enhanced_ai_service.generate_contextual_response(
                str(current_user.id), 
                f"[User seems frustrated] {message.content}",
                context
            )
        else:
            ai_response = await enhanced_ai_service.generate_contextual_response(
                str(current_user.id), 
                message.content,
                context
            )
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            sender_id=str(current_user.id),
            content=message.content,
            message_type="text"
        )
        db.add(user_message)
        
        # Save agent response
        agent_message = Message(
            conversation_id=conversation.id,
            sender_id="ai_agent",
            content=ai_response["message"],
            message_type="text",
            metadata={
                "emotional_tone": ai_response.get("emotional_tone"),
                "suggestions": ai_response.get("suggestions", []),
                "follow_up_questions": ai_response.get("follow_up_questions", []),
                "frustration_detected": frustration_analysis["is_frustrated"]
            }
        )
        db.add(agent_message)
        
        await db.commit()
        
        return {
            "response": ai_response["message"],
            "suggestions": ai_response.get("suggestions", []),
            "follow_up_questions": ai_response.get("follow_up_questions", []),
            "emotional_tone": ai_response.get("emotional_tone", "neutral"),
            "proactive_insights": ai_response.get("proactive_insights", []),
            "context": {
                "current_topic": context.current_topic,
                "emotional_state": context.emotional_state.value,
                "user_goals": context.user_goals
            },
            "frustration_analysis": frustration_analysis if frustration_analysis["is_frustrated"] else None
        }
        
    except Exception as e:
        print(f"Enhanced chat error: {e}")
        
        # Fallback to basic AI agent
        try:
            basic_response = await ai_agent_service.process_message(
                str(current_user.id), 
                message.content
            )
            
            return {
                "response": basic_response.get("response", "I apologize, but I'm experiencing some technical issues. Could you please try again?"),
                "suggestions": [],
                "follow_up_questions": [],
                "emotional_tone": "neutral",
                "proactive_insights": [],
                "context": {},
                "frustration_analysis": None
            }
            
        except Exception as fallback_error:
            print(f"Fallback chat error: {fallback_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to process your message at this time. Please try again later."
            )

@router.post("/analyze-personality")
async def analyze_user_personality(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Analyze user personality from conversation history."""
    
    async def analyze_personality_task():
        try:
            # Get user's conversation history
            result = await db.execute(
                select(Message)
                .join(Conversation)
                .where(
                    Conversation.participants.contains([str(current_user.id)]) &
                    (Message.sender_id == str(current_user.id))
                )
                .order_by(Message.created_at.desc())
                .limit(50)
            )
            messages = result.scalars().all()
            
            # Prepare conversation data
            conversation_data = []
            for msg in messages:
                conversation_data.append({
                    "type": "message",
                    "sender": "user",
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat()
                })
            
            # Analyze personality
            personality_profile = await enhanced_ai_service.analyze_personality(
                str(current_user.id), 
                conversation_data
            )
            
            print(f"Personality analysis completed for user {current_user.id}")
            
        except Exception as e:
            print(f"Personality analysis failed: {e}")
    
    background_tasks.add_task(analyze_personality_task)
    
    return {"message": "Personality analysis started. Results will be available shortly."}

@router.get("/personality-insights")
async def get_personality_insights(
    current_user: User = Depends(get_current_user)
):
    """Get user's personality insights and analysis."""
    
    insights = enhanced_ai_service.get_user_insights(str(current_user.id))
    
    if not insights.get("personality_available"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Personality analysis not available. Please chat with the AI agent to build your profile."
        )
    
    return insights

@router.get("/proactive-suggestions")
async def get_proactive_suggestions(
    current_user: User = Depends(get_current_user)
):
    """Get proactive suggestions based on user behavior and context."""
    
    suggestions = await enhanced_ai_service.generate_proactive_suggestions(str(current_user.id))
    
    return {
        "suggestions": suggestions,
        "generated_at": enhanced_ai_service.conversation_contexts.get(str(current_user.id), {}).get("last_interaction")
    }

@router.post("/workflow/{workflow_name}")
async def execute_langgraph_workflow(
    workflow_name: str,
    workflow_input: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """Execute a LangGraph workflow with enhanced context."""
    
    # Add user context to workflow input
    user_insights = enhanced_ai_service.get_user_insights(str(current_user.id))
    
    enhanced_input = {
        **workflow_input,
        "user_id": str(current_user.id),
        "user_context": user_insights.get("context", {}),
        "personality_profile": user_insights.get("personality", {})
    }
    
    try:
        result = await langgraph_service.execute_workflow(workflow_name, enhanced_input)
        
        return {
            "workflow": workflow_name,
            "result": result,
            "enhanced_with_context": True
        }
        
    except Exception as e:
        print(f"Workflow execution error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute workflow: {str(e)}"
        )

@router.get("/conversation-context")
async def get_conversation_context(
    current_user: User = Depends(get_current_user)
):
    """Get current conversation context for the user."""
    
    context = enhanced_ai_service.conversation_contexts.get(str(current_user.id))
    
    if not context:
        return {
            "context_available": False,
            "message": "No conversation context available. Start chatting to build context."
        }
    
    return {
        "context_available": True,
        "current_topic": context.current_topic,
        "user_goals": context.user_goals,
        "mentioned_preferences": context.mentioned_preferences,
        "emotional_state": context.emotional_state.value,
        "session_length": context.session_length,
        "last_interaction": context.last_interaction.isoformat()
    }

@router.post("/reset-context")
async def reset_conversation_context(
    current_user: User = Depends(get_current_user)
):
    """Reset conversation context for the user."""
    
    user_id = str(current_user.id)
    
    # Remove context
    enhanced_ai_service.conversation_contexts.pop(user_id, None)
    
    return {"message": "Conversation context reset successfully"}

@router.get("/ai-stats")
async def get_ai_service_stats(
    current_user: User = Depends(get_current_user)
):
    """Get AI service statistics and status."""
    
    return {
        "enhanced_ai_active": True,
        "personality_profiles_count": len(enhanced_ai_service.personality_profiles),
        "active_conversations": len(enhanced_ai_service.conversation_contexts),
        "user_has_personality_profile": str(current_user.id) in enhanced_ai_service.personality_profiles,
        "user_has_context": str(current_user.id) in enhanced_ai_service.conversation_contexts
    } 