from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from app.schemas.agent import RoommatePreferences
from app.services.ai_agent import ai_agent_service
from app.services.matching import matching_service
from app.models.user import User
from app.core.config import settings

# Define the state for our graph
class GraphState(TypedDict):
    query: str
    preferences: RoommatePreferences
    potential_matches: List[User]
    final_matches: List[dict]

class LangGraphService:
    def __init__(self):
        self.workflow = StateGraph(GraphState)
        self._setup_workflow()
        self.checkpointer = self._setup_checkpointer()
        self.app = self.workflow.compile(checkpointer=self.checkpointer)

    def _setup_checkpointer(self):
        from langgraph.checkpoints.aiopg import AsyncPGCheckpoint
        
        return AsyncPGCheckpoint.from_conn_string(
            conn_string=settings.DATABASE_URL,
        )
        
    def _setup_workflow(self):
        # Define the nodes
        self.workflow.add_node("extract_preferences", self.extract_preferences_node)
        self.workflow.add_node("find_potential_matches", self.find_potential_matches_node)
        self.workflow.add_node("score_matches", self.score_matches_node)

        # Build the graph
        self.workflow.set_entry_point("extract_preferences")
        self.workflow.add_edge("extract_preferences", "find_potential_matches")
        self.workflow.add_edge("find_potential_matches", "score_matches")
        self.workflow.add_edge("score_matches", END)

    async def extract_preferences_node(self, state: GraphState):
        """Node to extract preferences using the AI agent."""
        preferences = await ai_agent_service.extract_preferences(state["query"])
        return {"preferences": preferences}

    async def find_potential_matches_node(self, state: GraphState):
        """Node to find potential matches based on extracted preferences."""
        # This is a placeholder for a database query
        # In a real app, this would query users based on preferences
        from app.models.user import User  # Avoid circular import
        
        # For now, return a list of dummy users
        dummy_users = [
            User(id="1", email="test1@test.com", preferences={"budget": 1200}, lifestyle_data={"cleanliness": 4}),
            User(id="2", email="test2@test.com", preferences={"budget": 1300}, lifestyle_data={"cleanliness": 5})
        ]
        return {"potential_matches": dummy_users}

    def score_matches_node(self, state: GraphState):
        """Node to score potential matches."""
        # Create a dummy user object for scoring
        user = User(preferences=state["preferences"].dict())
        
        matches = matching_service.find_matches_for_user(
            user=user,
            potential_matches=state["potential_matches"]
        )
        return {"final_matches": matches}

    async def run_workflow(self, query: str, thread_id: str):
        """Run the full roommate matching workflow with checkpointing."""
        config = {"configurable": {"thread_id": thread_id}}
        inputs = {"query": query}
        return await self.app.ainvoke(inputs, config)

langgraph_service = LangGraphService() 