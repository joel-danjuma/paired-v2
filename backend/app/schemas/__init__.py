from .auth import Token, RefreshToken, UserRegister, UserLogin
from .user import UserProfile, UserUpdate, UserPublicProfile, User, UserWithListings
from .listing import ListingCreate, ListingUpdate, Listing, ListingWithUser
from .match import MatchAction, MatchRecommendation, MutualMatch
from .conversation import Conversation, Message, MessageCreate, ConversationCreate

# Resolve forward references
User.model_rebuild()
UserWithListings.model_rebuild()
Listing.model_rebuild()
ListingWithUser.model_rebuild()

__all__ = [
    "UserRegister",
    "UserLogin", 
    "Token",
    "RefreshToken",
    "UserProfile",
    "UserUpdate",
    "UserPublicProfile",
    "ListingCreate",
    "ListingUpdate",
    "Listing",
    "ListingWithUser",
    "MatchAction",
    "MatchRecommendation",
    "MutualMatch",
    "AgentQuery",
    "AgentResponse",
    "RoommatePreferences",
    "ConversationCreate",
    "Conversation",
    "ConversationWithMessages",
    "MessageCreate",
    "Message",
    "IdentityDocumentUpload",
    "VerificationResult",
    "EmailVerificationRequest",
    "EmailVerificationConfirm",
    "VerificationStatus"
] 