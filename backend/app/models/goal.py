from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone
class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_email = Column(String, index=True, nullable=False) 
    title = Column(String, nullable=False)
    category = Column(String, default="Side Hustle")
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    
    # ENSURE THIS EXACT LINE IS HERE:
    deadline = Column(Date, nullable=True) 
    
    status = Column(String, default="active")
    # ... rest of the file
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, 
                        default=lambda: datetime.now(timezone.utc), 
                        onupdate=lambda: datetime.now(timezone.utc))

    # 4. Relationship (Back-reference to User model)
    # Ensure your User model has: goals = relationship("Goal", back_populates="owner")
    owner = relationship("User", back_populates="goals")

    @property
    def progress_percentage(self) -> float:
        """
        Quantum Progress Logic:
        Calculates the completion ratio for React Progress Bars.
        """
        if not self.target_amount or self.target_amount <= 0:
            return 0.0
        
        calculation = (self.current_amount / self.target_amount) * 100
        # Cap at 100% to avoid progress bar overflow in the UI
        return round(min(calculation, 100.0), 2)

    def __repr__(self):
        return f"<Goal(title={self.title}, progress={self.progress_percentage}%)>"