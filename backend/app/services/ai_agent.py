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
    
    # Mock data - in production this would query the database
    return [
        {
            "title": f"Modern {min_bedrooms}-Bedroom Apartment",
            "address": "123 Main St", 
            "city": city, 
            "rent": min(max_budget - 50, 1400), 
            "bedrooms": min_bedrooms,
            "amenities": ["WiFi", "Parking", "Kitchen"]
        },
        {
            "title": f"Cozy {min_bedrooms}-Bedroom House",
            "address": "456 Oak Ave", 
            "city": city, 
            "rent": min(max_budget - 100, 1350), 
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
    
    # Mock data - in production this would use the matching algorithm
    return [
        {
            "name": "Alex Johnson",
            "compatibility_score": 0.85,
            "shared_interests": ["reading", "hiking"],
            "lifestyle": "clean and quiet"
        },
        {
            "name": "Jamie Smith", 
            "compatibility_score": 0.78,
            "shared_interests": ["cooking", "movies"],
            "lifestyle": "social and organized"
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
                
                Key capabilities:
                - Search for rental listings based on user criteria
                - Find compatible roommates based on preferences and lifestyle
                - Provide housing advice and tips
                - Extract preferences from natural language descriptions
                
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
                "response": "AI agent is currently unavailable. Please try again later.",
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
                                print(f"Tool execution error: {e}")
            
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
                "response": "I'm sorry, I encountered an error processing your request. Please try again.",
                "conversation_id": conversation_id,
                "tool_outputs": []
            }

# --- Instantiate the Service --- #
ai_agent_service = AIAgentService()