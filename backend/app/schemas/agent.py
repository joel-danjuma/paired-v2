from pydantic import BaseModel, Field
from typing import List, Optional

class RoommatePreferences(BaseModel):
    """Extracted roommate preferences from a user's query."""
    city: Optional[str] = Field(None, description="The desired city")
    max_budget: Optional[int] = Field(None, description="Maximum budget for rent")
    min_budget: Optional[int] = Field(None, description="Minimum budget for rent")
    
    # Lifestyle attributes
    cleanliness: Optional[str] = Field(None, description="Desired cleanliness level (e.g., 'very clean', 'tidy', 'relaxed')")
    social_habits: Optional[List[str]] = Field(None, description="Social habits (e.g., 'quiet', 'social', 'party-friendly')")
    work_schedule: Optional[str] = Field(None, description="Work schedule (e.g., '9-to-5', 'remote', 'flexible')")
    
    # Roommate characteristics
    desired_gender: Optional[str] = Field(None, description="Desired gender of roommate")
    desired_age_min: Optional[int] = Field(None, description="Minimum age of roommate")
    desired_age_max: Optional[int] = Field(None, description="Maximum age of roommate")

class AgentQuery(BaseModel):
    query: str

class AgentResponse(BaseModel):
    preferences: RoommatePreferences
    original_query: str
    response_text: str 

class AgentMessage(BaseModel):
    sender: str
    content: str

class AgentChatRequest(BaseModel):
    messages: List[AgentMessage]
    conversation_id: Optional[str] = None 