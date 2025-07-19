import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
import json
import re
from dataclasses import dataclass
from enum import Enum

from pydantic_ai import Agent
from app.core.config import settings
from app.services.ai_agent import ai_agent_service

class PersonalityTrait(str, Enum):
    """Personality traits for analysis."""
    OPENNESS = "openness"
    CONSCIENTIOUSNESS = "conscientiousness"
    EXTRAVERSION = "extraversion"
    AGREEABLENESS = "agreeableness"
    NEUROTICISM = "neuroticism"

class UserMood(str, Enum):
    """User mood states."""
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    FRUSTRATED = "frustrated"
    EXCITED = "excited"
    CONFUSED = "confused"
    STRESSED = "stressed"

@dataclass
class PersonalityProfile:
    """User personality profile."""
    openness: float  # 0-1 scale
    conscientiousness: float
    extraversion: float
    agreeableness: float
    neuroticism: float
    confidence: float  # Confidence in the analysis
    last_updated: datetime

@dataclass
class ConversationContext:
    """Context information for conversations."""
    user_id: str
    conversation_history: List[Dict[str, Any]]
    current_topic: Optional[str]
    user_goals: List[str]
    mentioned_preferences: Dict[str, Any]
    emotional_state: UserMood
    last_interaction: datetime
    session_length: int

class EnhancedAIService:
    """Enhanced AI service with personality analysis and context awareness."""
    
    def __init__(self):
        self.personality_profiles = {}
        self.conversation_contexts = {}
        self.proactive_suggestions = {}
        
        # Initialize personality analysis agent
        self.personality_agent = Agent(
            'google-generative-ai:gemini-2.0-flash-exp',
            system_prompt="""You are a personality analysis expert. Analyze user messages and interactions to determine personality traits based on the Big Five model (OCEAN):
            - Openness: creativity, curiosity, openness to experience
            - Conscientiousness: organization, dependability, discipline
            - Extraversion: sociability, assertiveness, energy level
            - Agreeableness: trust, altruism, kindness, cooperation
            - Neuroticism: anxiety, anger, depression, vulnerability
            
            Return scores from 0.0 to 1.0 for each trait based on the user's communication style, preferences, and behavior patterns.
            Also provide a confidence score for your analysis."""
        )
        
        # Initialize context-aware agent
        self.context_agent = Agent(
            'google-generative-ai:gemini-2.0-flash-exp',
            system_prompt="""You are a context-aware conversational AI that helps with roommate matching and housing decisions. 
            Use conversation history, user preferences, and personality insights to provide personalized, contextually relevant responses.
            
            Key capabilities:
            1. Remember user preferences and goals across conversations
            2. Adapt communication style to user personality
            3. Provide proactive suggestions based on user patterns
            4. Recognize emotional states and respond appropriately
            5. Help users refine their housing search criteria
            
            Always be helpful, empathetic, and focused on finding the best roommate/housing matches."""
        )
    
    async def analyze_personality(self, user_id: str, conversation_data: List[Dict[str, Any]]) -> PersonalityProfile:
        """
        Analyze user personality from conversation data.
        
        Args:
            user_id: User ID
            conversation_data: List of conversation messages and interactions
            
        Returns:
            PersonalityProfile with trait scores
        """
        try:
            # Prepare conversation text for analysis
            conversation_text = self._prepare_conversation_text(conversation_data)
            
            # Analyze personality traits
            analysis_prompt = f"""
            Analyze the following conversation data and rate the user's personality traits:
            
            Conversation Data:
            {conversation_text}
            
            Provide scores (0.0 to 1.0) for each Big Five trait and overall confidence:
            - Openness: How open to new experiences, creative, and curious is the user?
            - Conscientiousness: How organized, reliable, and disciplined is the user?
            - Extraversion: How social, assertive, and energetic is the user?
            - Agreeableness: How cooperative, trusting, and helpful is the user?
            - Neuroticism: How anxious, emotional, and stressed does the user seem?
            
            Return as JSON: {{"openness": 0.0, "conscientiousness": 0.0, "extraversion": 0.0, "agreeableness": 0.0, "neuroticism": 0.0, "confidence": 0.0}}
            """
            
            result = await self.personality_agent.run(analysis_prompt)
            
            # Parse the result
            personality_data = self._parse_personality_result(result.data)
            
            # Create personality profile
            profile = PersonalityProfile(
                openness=personality_data.get("openness", 0.5),
                conscientiousness=personality_data.get("conscientiousness", 0.5),
                extraversion=personality_data.get("extraversion", 0.5),
                agreeableness=personality_data.get("agreeableness", 0.5),
                neuroticism=personality_data.get("neuroticism", 0.5),
                confidence=personality_data.get("confidence", 0.5),
                last_updated=datetime.utcnow()
            )
            
            # Store profile
            self.personality_profiles[user_id] = profile
            
            return profile
            
        except Exception as e:
            print(f"Failed to analyze personality for user {user_id}: {e}")
            
            # Return default profile
            return PersonalityProfile(
                openness=0.5, conscientiousness=0.5, extraversion=0.5,
                agreeableness=0.5, neuroticism=0.5, confidence=0.1,
                last_updated=datetime.utcnow()
            )
    
    async def update_conversation_context(
        self, 
        user_id: str, 
        message: str, 
        conversation_history: List[Dict[str, Any]]
    ) -> ConversationContext:
        """
        Update conversation context with new message.
        
        Args:
            user_id: User ID
            message: Latest user message
            conversation_history: Full conversation history
            
        Returns:
            Updated conversation context
        """
        # Get existing context or create new one
        context = self.conversation_contexts.get(user_id, ConversationContext(
            user_id=user_id,
            conversation_history=[],
            current_topic=None,
            user_goals=[],
            mentioned_preferences={},
            emotional_state=UserMood.NEUTRAL,
            last_interaction=datetime.utcnow(),
            session_length=0
        ))
        
        # Update context
        context.conversation_history = conversation_history
        context.last_interaction = datetime.utcnow()
        context.session_length += 1
        
        # Analyze current message for topic and emotional state
        context.current_topic = await self._extract_topic(message)
        context.emotional_state = await self._detect_emotional_state(message)
        
        # Extract and update preferences
        new_preferences = await self._extract_preferences(message)
        context.mentioned_preferences.update(new_preferences)
        
        # Update goals
        new_goals = await self._extract_goals(message)
        for goal in new_goals:
            if goal not in context.user_goals:
                context.user_goals.append(goal)
        
        # Store updated context
        self.conversation_contexts[user_id] = context
        
        return context
    
    async def generate_contextual_response(
        self, 
        user_id: str, 
        message: str, 
        context: Optional[ConversationContext] = None
    ) -> Dict[str, Any]:
        """
        Generate a contextual response using personality and conversation history.
        
        Args:
            user_id: User ID
            message: User message
            context: Conversation context
            
        Returns:
            Response with message and metadata
        """
        try:
            # Get or update context
            if not context:
                context = self.conversation_contexts.get(user_id)
            
            # Get personality profile
            personality = self.personality_profiles.get(user_id)
            
            # Prepare context for AI
            context_prompt = self._build_context_prompt(user_id, message, context, personality)
            
            # Generate response
            result = await self.context_agent.run(context_prompt)
            
            # Parse and enhance response
            response = self._enhance_response(result.data, personality, context)
            
            return {
                "message": response["text"],
                "suggestions": response.get("suggestions", []),
                "emotional_tone": response.get("tone", "neutral"),
                "follow_up_questions": response.get("follow_up", []),
                "proactive_insights": response.get("insights", [])
            }
            
        except Exception as e:
            print(f"Failed to generate contextual response: {e}")
            
            # Fallback to basic AI agent
            basic_response = await ai_agent_service.process_message(user_id, message)
            return {
                "message": basic_response.get("response", "I'm sorry, I encountered an issue. Could you please try again?"),
                "suggestions": [],
                "emotional_tone": "neutral",
                "follow_up_questions": [],
                "proactive_insights": []
            }
    
    async def generate_proactive_suggestions(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Generate proactive suggestions based on user behavior and context.
        
        Args:
            user_id: User ID
            
        Returns:
            List of proactive suggestions
        """
        context = self.conversation_contexts.get(user_id)
        personality = self.personality_profiles.get(user_id)
        
        if not context:
            return []
        
        suggestions = []
        
        # Time-based suggestions
        time_since_last = datetime.utcnow() - context.last_interaction
        
        if time_since_last > timedelta(days=3):
            suggestions.append({
                "type": "check_in",
                "title": "How's your roommate search going?",
                "message": "It's been a few days since we last talked. Would you like to see some new matches or update your preferences?",
                "priority": "medium"
            })
        
        # Goal-based suggestions
        if "find_roommate" in context.user_goals:
            suggestions.append({
                "type": "goal_progress",
                "title": "New roommate matches available",
                "message": "I found some new potential roommates that match your criteria. Would you like to review them?",
                "priority": "high"
            })
        
        # Preference-based suggestions
        if context.mentioned_preferences.get("budget"):
            budget = context.mentioned_preferences["budget"]
            suggestions.append({
                "type": "preference_optimization",
                "title": "Budget optimization tip",
                "message": f"Based on your budget of ${budget}, I can show you some ways to maximize your options in your preferred areas.",
                "priority": "low"
            })
        
        # Personality-based suggestions
        if personality and personality.extraversion > 0.7:
            suggestions.append({
                "type": "personality_match",
                "title": "Social roommate matches",
                "message": "I noticed you seem to enjoy social activities. I found some outgoing roommates who might be a great fit!",
                "priority": "medium"
            })
        
        # Limit to top 3 suggestions
        suggestions.sort(key=lambda x: {"high": 3, "medium": 2, "low": 1}[x["priority"]], reverse=True)
        return suggestions[:3]
    
    async def detect_user_frustration(self, user_id: str, recent_messages: List[str]) -> Dict[str, Any]:
        """
        Detect if user is frustrated and provide appropriate support.
        
        Args:
            user_id: User ID
            recent_messages: Recent user messages
            
        Returns:
            Frustration analysis and suggested interventions
        """
        frustration_indicators = [
            "not working", "frustrated", "annoying", "terrible", "useless",
            "can't find", "nothing good", "waste of time", "not helpful"
        ]
        
        # Check for frustration keywords
        frustration_score = 0
        for message in recent_messages[-5:]:  # Check last 5 messages
            message_lower = message.lower()
            for indicator in frustration_indicators:
                if indicator in message_lower:
                    frustration_score += 1
        
        # Analyze message tone
        context = self.conversation_contexts.get(user_id)
        emotional_state = context.emotional_state if context else UserMood.NEUTRAL
        
        is_frustrated = (
            frustration_score > 0 or 
            emotional_state in [UserMood.FRUSTRATED, UserMood.STRESSED]
        )
        
        interventions = []
        if is_frustrated:
            interventions = [
                "Acknowledge the frustration and offer personalized help",
                "Suggest speaking with a human agent",
                "Provide simplified search options",
                "Offer to reset preferences and start fresh"
            ]
        
        return {
            "is_frustrated": is_frustrated,
            "frustration_level": min(frustration_score / 3, 1.0),
            "emotional_state": emotional_state.value if context else "neutral",
            "suggested_interventions": interventions
        }
    
    def _prepare_conversation_text(self, conversation_data: List[Dict[str, Any]]) -> str:
        """Prepare conversation data for personality analysis."""
        text_parts = []
        
        for item in conversation_data[-20:]:  # Use last 20 interactions
            if item.get("type") == "message" and item.get("sender") == "user":
                text_parts.append(f"User: {item.get('content', '')}")
            elif item.get("type") == "preference":
                text_parts.append(f"Preference: {item.get('description', '')}")
        
        return "\n".join(text_parts)
    
    def _parse_personality_result(self, result_text: str) -> Dict[str, float]:
        """Parse personality analysis result."""
        try:
            # Extract JSON from the result
            json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Return default values if parsing fails
        return {
            "openness": 0.5,
            "conscientiousness": 0.5,
            "extraversion": 0.5,
            "agreeableness": 0.5,
            "neuroticism": 0.5,
            "confidence": 0.3
        }
    
    async def _extract_topic(self, message: str) -> Optional[str]:
        """Extract main topic from user message."""
        topics = {
            "roommate_search": ["roommate", "roomie", "flatmate", "housemate"],
            "housing_search": ["apartment", "house", "room", "place", "housing"],
            "preferences": ["prefer", "like", "want", "need", "looking for"],
            "budget": ["budget", "price", "cost", "afford", "expensive", "cheap"],
            "location": ["location", "area", "neighborhood", "near", "close to"],
            "lifestyle": ["lifestyle", "habits", "schedule", "work", "social"]
        }
        
        message_lower = message.lower()
        for topic, keywords in topics.items():
            if any(keyword in message_lower for keyword in keywords):
                return topic
        
        return None
    
    async def _detect_emotional_state(self, message: str) -> UserMood:
        """Detect emotional state from message."""
        message_lower = message.lower()
        
        # Positive indicators
        positive_words = ["great", "awesome", "perfect", "love", "excited", "happy"]
        if any(word in message_lower for word in positive_words):
            return UserMood.POSITIVE
        
        # Frustration indicators
        frustrated_words = ["frustrated", "annoying", "terrible", "useless", "awful"]
        if any(word in message_lower for word in frustrated_words):
            return UserMood.FRUSTRATED
        
        # Confusion indicators
        confused_words = ["confused", "don't understand", "unclear", "lost"]
        if any(word in message_lower for word in confused_words):
            return UserMood.CONFUSED
        
        # Excitement indicators
        excited_words = ["excited", "can't wait", "amazing", "fantastic"]
        if any(word in message_lower for word in excited_words):
            return UserMood.EXCITED
        
        return UserMood.NEUTRAL
    
    async def _extract_preferences(self, message: str) -> Dict[str, Any]:
        """Extract preferences from user message."""
        preferences = {}
        message_lower = message.lower()
        
        # Budget extraction
        budget_pattern = r'\$?(\d{1,4})'
        budget_matches = re.findall(budget_pattern, message)
        if budget_matches and any(keyword in message_lower for keyword in ["budget", "price", "cost"]):
            preferences["budget"] = int(budget_matches[0])
        
        # Location preferences
        if "near" in message_lower or "close to" in message_lower:
            # Extract location after "near" or "close to"
            location_pattern = r'(?:near|close to)\s+([^,.!?]+)'
            location_match = re.search(location_pattern, message_lower)
            if location_match:
                preferences["preferred_location"] = location_match.group(1).strip()
        
        return preferences
    
    async def _extract_goals(self, message: str) -> List[str]:
        """Extract user goals from message."""
        goals = []
        message_lower = message.lower()
        
        goal_indicators = {
            "find_roommate": ["find roommate", "looking for roommate", "need roommate"],
            "find_housing": ["find apartment", "find house", "find place", "looking for place"],
            "move_soon": ["move soon", "asap", "urgent", "quickly"],
            "save_money": ["save money", "cheaper", "budget-friendly", "affordable"]
        }
        
        for goal, indicators in goal_indicators.items():
            if any(indicator in message_lower for indicator in indicators):
                goals.append(goal)
        
        return goals
    
    def _build_context_prompt(
        self, 
        user_id: str, 
        message: str, 
        context: Optional[ConversationContext],
        personality: Optional[PersonalityProfile]
    ) -> str:
        """Build context prompt for AI agent."""
        prompt_parts = [f"User message: {message}"]
        
        if context:
            prompt_parts.append(f"Current topic: {context.current_topic}")
            prompt_parts.append(f"User goals: {', '.join(context.user_goals)}")
            prompt_parts.append(f"Emotional state: {context.emotional_state.value}")
            
            if context.mentioned_preferences:
                prompt_parts.append(f"User preferences: {context.mentioned_preferences}")
        
        if personality:
            traits = [
                f"Openness: {personality.openness:.2f}",
                f"Conscientiousness: {personality.conscientiousness:.2f}",
                f"Extraversion: {personality.extraversion:.2f}",
                f"Agreeableness: {personality.agreeableness:.2f}",
                f"Neuroticism: {personality.neuroticism:.2f}"
            ]
            prompt_parts.append(f"Personality traits: {', '.join(traits)}")
        
        return "\n".join(prompt_parts)
    
    def _enhance_response(
        self, 
        response_text: str, 
        personality: Optional[PersonalityProfile],
        context: Optional[ConversationContext]
    ) -> Dict[str, Any]:
        """Enhance response based on personality and context."""
        enhanced_response = {"text": response_text}
        
        # Add suggestions based on personality
        if personality:
            suggestions = []
            
            if personality.openness > 0.7:
                suggestions.append("Explore unique housing options in creative neighborhoods")
            
            if personality.conscientiousness > 0.7:
                suggestions.append("Create a detailed roommate screening checklist")
            
            if personality.extraversion > 0.7:
                suggestions.append("Look for social roommates who enjoy group activities")
            
            enhanced_response["suggestions"] = suggestions[:2]
        
        # Add tone based on emotional state
        if context and context.emotional_state == UserMood.FRUSTRATED:
            enhanced_response["tone"] = "empathetic"
        elif context and context.emotional_state == UserMood.EXCITED:
            enhanced_response["tone"] = "enthusiastic"
        else:
            enhanced_response["tone"] = "helpful"
        
        return enhanced_response
    
    def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user insights."""
        personality = self.personality_profiles.get(user_id)
        context = self.conversation_contexts.get(user_id)
        
        insights = {
            "personality_available": personality is not None,
            "context_available": context is not None
        }
        
        if personality:
            insights["personality"] = {
                "openness": personality.openness,
                "conscientiousness": personality.conscientiousness,
                "extraversion": personality.extraversion,
                "agreeableness": personality.agreeableness,
                "neuroticism": personality.neuroticism,
                "confidence": personality.confidence,
                "last_updated": personality.last_updated.isoformat()
            }
        
        if context:
            insights["context"] = {
                "current_topic": context.current_topic,
                "user_goals": context.user_goals,
                "mentioned_preferences": context.mentioned_preferences,
                "emotional_state": context.emotional_state.value,
                "session_length": context.session_length,
                "last_interaction": context.last_interaction.isoformat()
            }
        
        return insights

# Global enhanced AI service instance
enhanced_ai_service = EnhancedAIService() 