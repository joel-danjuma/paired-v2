
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Enum as SAEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import uuid
import enum

class NotificationType(str, enum.Enum):
    NEW_MATCH = "new_match"
    NEW_MESSAGE = "new_message"
    LISTING_UPDATE = "listing_update"
    PROFILE_VERIFICATION = "profile_verification"
    AGENT_MESSAGE = "agent_message"
    SYSTEM_ALERT = "system_alert"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SAEnum(NotificationType), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type='{self.type}')>" 