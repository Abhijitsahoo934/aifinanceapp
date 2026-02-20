from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # Supports Google OAuth null pass
    
    # --- Persona Settings (Personalization Engine) ---
    # These ensure the AI always has a string to work with, never 'None'
    role = Column(String, default="student", nullable=False)     # student | professional | business
    level = Column(String, default="beginner", nullable=False)   # beginner | intermediate | pro
    risk_appetite = Column(String, default="Medium", nullable=False)
    
    # --- Account Metadata ---
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # NEW: Switched to timezone-aware UTC for global model consistency
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # --- Relationships (The Database Glue) ---
    # 1-to-1 link for the Portfolio
    portfolio = relationship("Portfolio", back_populates="owner", uselist=False, cascade="all, delete-orphan")
    
    # 1-to-Many links for Goals and History
    goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(email={self.email}, role={self.role})>"