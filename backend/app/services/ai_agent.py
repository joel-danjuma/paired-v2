from google.generativeai import GenerativeModel
import google.generativeai as genai
import json
from typing import Optional
from app.core.config import settings
from app.schemas.agent import RoommatePreferences

class AIAgentService:
    def __init__(self):
        if not settings.google_api_key:
            raise ValueError("Google API key is not configured.")
            
        genai.configure(api_key=settings.google_api_key)
        self.model = GenerativeModel('gemini-1.5-flash')

    async def extract_preferences(self, query: str) -> RoommatePreferences:
        """
        Extract structured roommate preferences from a natural language query.
        """
        try:
            prompt = (
                f"Extract the user's roommate preferences from the following query: '{query}'\n"
                "Focus on details like city, budget, cleanliness, social habits, and desired roommate characteristics.\n"
                f"Return the result as a JSON object that conforms to this Pydantic schema:\n{RoommatePreferences.schema_json(indent=2)}"
            )
            
            response = await self.model.generate_content_async(prompt)
            
            # Extract JSON from the response text
            json_text = self._extract_json(response.text)
            
            if json_text:
                preferences_dict = json.loads(json_text)
                return RoommatePreferences(**preferences_dict)
            else:
                return RoommatePreferences()

        except Exception as e:
            # Handle potential errors from the LLM API
            print(f"Error extracting preferences: {e}")
            # Fallback to a default or empty response
            return RoommatePreferences()

    def _extract_json(self, text: str) -> Optional[str]:
        """Extracts the first valid JSON object from a string."""
        import re
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            return match.group()
        return None

ai_agent_service = AIAgentService()