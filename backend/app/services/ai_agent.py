import google.generativeai as genai
from typing import List
from app.core.config import settings
from app.schemas.conversation import Message

# Configure the generative AI model
genai.configure(api_key=settings.google_api_key)

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
    # In a real implementation, this would query the database.
    # For now, we'll return some dummy data.
    print(f"Searching for listings in {city} with a max budget of {max_budget} and at least {min_bedrooms} bedroom(s)...")
    return [
        {"address": "123 Main St", "city": city, "rent": 1400, "bedrooms": min_bedrooms},
        {"address": "456 Oak Ave", "city": city, "rent": 1450, "bedrooms": min_bedrooms},
    ]

# --- AI Agent Service --- #

class AIAgentService:
    def __init__(self, tools: List[callable] = None):
        """
        Initializes the AI Agent Service.
        
        Args:
            tools: A list of callable functions that the agent can use.
        """
        self.model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=tools,
        )

    async def chat(self, user_id: str, messages: List[dict], conversation_id: str = None) -> dict:
        """
        Handles a chat interaction with the AI agent, including tool calls.

        Args:
            user_id: The ID of the user starting the chat.
            messages: A list of messages in the conversation.
            conversation_id: The optional ID of the existing conversation.

        Returns:
            A dictionary containing the agent's response and any tool outputs.
        """
        # For now, we'll just use the content of the messages.
        # In a real implementation, you might want to map sender/role.
        history = [{"role": msg.sender, "parts": [msg.content]} for msg in messages[:-1]]
        latest_message = messages[-1].content
        
        # Start a chat session with the model
        chat_session = self.model.start_chat(history=history)
        
        # Send the message to the model
        response = await chat_session.send_message_async(latest_message)
        
        response_data = {"content": "", "tool_outputs": []}

        # Check for function calls
        if response.candidates[0].content.parts[0].function_call:
            function_call = response.candidates[0].content.parts[0].function_call
            tool_function = self.tools_map.get(function_call.name)
            
            if tool_function:
                tool_response = tool_function(**function_call.args)
                
                # Send tool response back to the model
                response = await chat_session.send_message_async(
                    [{"function_response": {"name": function_call.name, "response": tool_response}}]
                )
                response_data["tool_outputs"].append(tool_response)

        response_data["content"] = response.text
        return response_data

# --- Instantiate the Service --- #

# A dictionary to map tool names to their functions
tools_map = {
    "search_for_listings": search_for_listings,
}

# Instantiate the service with the defined tools
ai_agent_service = AIAgentService(tools=list(tools_map.values()))
ai_agent_service.tools_map = tools_map