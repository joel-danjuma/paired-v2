import google.generativeai as genai
from typing import List, Dict, Any, Optional
from app.core.config import settings
import uuid
import json

# Configure the generative AI model
try:
    genai.configure(api_key=settings.google_api_key)
except Exception as e:
    print(f"Warning: Failed to configure Google AI: {e}")

# --- Define Tools --- #

def search_for_listings(city: str, max_budget: int, min_bedrooms: int = 1):
    """
    Searches for rental listings based on specified criteria.

    Args:
        city: The city to search in.
        max_budget: The maximum budget for the rent.
        min_bedrooms: The minimum number of bedrooms required.
    
    Returns:
        A list of listings that match the criteria.
    """
    print(f"Searching for listings in {city} with a max budget of {max_budget} and at least {min_bedrooms} bedroom(s)...")
    
    # Mock data with realistic Nigerian pricing - in production this would query the database
    return [
        {
            "title": f"Modern {min_bedrooms}-Bedroom Apartment",
            "address": "123 Main St", 
            "city": city, 
            "rent": min(max_budget - 50000, max_budget * 0.9), 
            "bedrooms": min_bedrooms,
            "amenities": ["WiFi", "Parking", "Kitchen"]
        },
        {
            "title": f"Cozy {min_bedrooms}-Bedroom House",
            "address": "456 Oak Ave", 
            "city": city, 
            "rent": min(max_budget - 100000, max_budget * 0.8), 
            "bedrooms": min_bedrooms,
            "amenities": ["Garden", "Parking", "Furnished"]
        }
    ]

def find_compatible_roommates(preferences: Dict[str, Any]):
    """
    Find compatible roommates based on user preferences.
    
    Args:
        preferences: Dictionary of user preferences
        
    Returns:
        List of compatible roommates
    """
    print(f"Finding compatible roommates with preferences: {preferences}")
    
    try:
        # Enhanced mock data with better error handling
        roommates = [
            {
                "name": "Alex Johnson",
                "compatibility_score": 0.85,
                "shared_interests": ["reading", "hiking"],
                "lifestyle": "clean and quiet",
                "age": 24,
                "occupation": "Software Engineer"
            },
            {
                "name": "Jamie Smith", 
                "compatibility_score": 0.78,
                "shared_interests": ["cooking", "movies"],
                "lifestyle": "social and organized",
                "age": 26,
                "occupation": "Teacher"
            },
            {
                "name": "Casey Lee",
                "compatibility_score": 0.72,
                "shared_interests": ["fitness", "music"],
                "lifestyle": "active and friendly",
                "age": 23,
                "occupation": "Designer"
            }
        ]
        
        # Filter based on preferences if provided
        if preferences:
            lifestyle_pref = preferences.get('lifestyle', '').lower()
            if lifestyle_pref:
                # Sort by lifestyle match
                roommates = sorted(roommates, 
                    key=lambda x: 1 if lifestyle_pref in x['lifestyle'].lower() else 0, 
                    reverse=True)
        
        return roommates
        
    except Exception as e:
        print(f"Error in find_compatible_roommates: {e}")
        # Return fallback data if there's an error
        return [
            {
                "name": "Taylor Wilson",
                "compatibility_score": 0.70,
                "shared_interests": ["movies", "cooking"],
                "lifestyle": "friendly and respectful",
                "age": 25,
                "occupation": "Student"
            }
        ]

# --- AI Agent Service --- #

class AIAgentService:
    def __init__(self):
        """Initialize the AI Agent Service."""
        self.conversations = {}  # Store conversation history
        
        # Define available tools
        self.available_tools = [
            {
                "function_declarations": [
                    {
                        "name": "search_for_listings",
                        "description": "Search for rental listings based on criteria",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "city": {
                                    "type": "string",
                                    "description": "The city to search in"
                                },
                                "max_budget": {
                                    "type": "integer", 
                                    "description": "Maximum budget for rent"
                                },
                                "min_bedrooms": {
                                    "type": "integer",
                                    "description": "Minimum number of bedrooms"
                                }
                            },
                            "required": ["city", "max_budget"]
                        }
                    },
                    {
                        "name": "find_compatible_roommates",
                        "description": "Find compatible roommates based on preferences",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "preferences": {
                                    "type": "object",
                                    "description": "User preferences for roommate matching"
                                }
                            },
                            "required": ["preferences"]
                        }
                    }
                ]
            }
        ]
        
        # Tool function mapping
        self.tool_functions = {
            "search_for_listings": search_for_listings,
            "find_compatible_roommates": find_compatible_roommates
        }
        
        try:
            # Initialize the model with tools
            self.model = genai.GenerativeModel(
                model_name='gemini-1.5-flash',
                tools=self.available_tools,
                system_instruction="""You are a helpful roommate matching assistant. Help users find compatible roommates and suitable housing. 

                IMPORTANT RESPONSE RULES:
                - NEVER mention function names, tool calls, or technical terms in responses
                - Always respond naturally as if you personally searched/found results
                - If you use tools, present results as your own recommendations
                - Be conversational, friendly, and helpful
                - Focus on the user's housing needs and preferences
                - Don't say things like "I'll use search_for_listings" or "calling find_compatible_roommates"

                Key capabilities:
                - Search for rental listings based on user criteria  
                - Find compatible roommates based on preferences and lifestyle
                - Provide housing advice and tips
                - Extract preferences from natural language descriptions

                Example good responses:
                - "I found some great listings for you in [city]..."
                - "Based on your preferences, I recommend these roommates..."
                - "Let me help you find something in your budget..."
                - "Here are some compatible roommates I found..."

                Example BAD responses (NEVER do this):
                - "I'll use search_for_listings to find..."
                - "Calling find_compatible_roommates function..."
                - "Tool execution completed..."
                - "Function call successful..."

                Always be helpful, friendly, and focused on finding the best matches for users."""
            )
        except Exception as e:
            print(f"Failed to initialize AI model: {e}")
            self.model = None

    async def process_message(
        self, 
        user_id: str, 
        message: str, 
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and return AI response.
        
        Args:
            user_id: User ID
            message: User message
            conversation_id: Optional conversation ID
            
        Returns:
            Dictionary with response, conversation_id, and tool_outputs
        """
        if not self.model:
            return {
                "response": "I'm currently unavailable, but I'd love to help you find roommates and housing! Please try again in a moment.",
                "conversation_id": conversation_id,
                "tool_outputs": []
            }
        
        try:
            # Get or create conversation
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            if conversation_id not in self.conversations:
                self.conversations[conversation_id] = []
            
            # Add user message to conversation history
            self.conversations[conversation_id].append({
                "role": "user",
                "parts": [message]
            })
            
            # Start chat session with history
            chat_session = self.model.start_chat(
                history=self.conversations[conversation_id][:-1]  # Exclude current message
            )
            
            # Send message and get response
            response = chat_session.send_message(message)
            
            tool_outputs = []
            
            # Handle tool calls if any
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        function_call = part.function_call
                        tool_name = function_call.name
                        
                        if tool_name in self.tool_functions:
                            try:
                                # Extract arguments
                                args = {}
                                for key, value in function_call.args.items():
                                    args[key] = value
                                
                                # Call the tool function
                                tool_result = self.tool_functions[tool_name](**args)
                                tool_outputs.extend(tool_result if isinstance(tool_result, list) else [tool_result])
                                
                                # Send tool response back to model
                                tool_response = chat_session.send_message([
                                    genai.protos.Part(
                                        function_response=genai.protos.FunctionResponse(
                                            name=tool_name,
                                            response={"result": tool_result}
                                        )
                                    )
                                ])
                                
                                response = tool_response
                                
                            except Exception as e:
                                print(f"Tool execution error for {tool_name}: {e}")
                                # Continue with a helpful message instead of failing
                                fallback_message = "I'm having trouble accessing that information right now, but I'm here to help you find great roommates and housing options! Could you tell me more about what you're looking for?"
                                response.text = fallback_message
            
            # Add AI response to conversation history
            self.conversations[conversation_id].append({
                "role": "model",
                "parts": [response.text]
            })
            
            return {
                "response": response.text,
                "conversation_id": conversation_id,
                "tool_outputs": tool_outputs
            }
            
        except Exception as e:
            print(f"AI processing error: {e}")
            return {
                "response": "I apologize, but I'm having a technical issue right now. I'm here to help you find roommates and housing! Could you try asking me again?",
                "conversation_id": conversation_id,
                "tool_outputs": []
            }

# --- Instantiate the Service --- #
ai_agent_service = AIAgentService()