from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Identity Linkage
    # Nullable=True allows guest chats to be saved without crashing, 
    # but CASCADE ensures cleanup if a registered user is deleted.
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user_email = Column(String, index=True) 
    
    # 2. Intelligence Content
    # Using Text is perfect for Llama 3.2's detailed markdown output
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    
    # 3. Contextual Snapshot
    # Remembers who the user was when they asked (important for audit trails)
    user_role = Column(String, default="student") 
    user_level = Column(String, default="beginner")
    
    # 4. Temporal Data
    # Updated to timezone-aware UTC to match Security and Goals models
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # 5. Relationship
    user = relationship("User", back_populates="chat_history")

    def __repr__(self):
        return f"<ChatHistory(user={self.user_email}, time={self.timestamp})>"