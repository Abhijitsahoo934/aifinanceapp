from sqlalchemy import Column, Integer, Float, ForeignKey, String, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    
    # 1. Identity Linkage
    # unique=True enforces the 1-to-1 relationship: One user, one financial profile.
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    owner_email = Column(String, index=True)

    # 2. Core Financial Metrics
    # Initialized as 0.0 to prevent 'NoneType' math errors in the AI logic
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    savings = Column(Float, default=0.0)      # Emergency Fund
    investments = Column(Float, default=0.0)  # Stocks/Crypto
    
    # 3. Metadata for Analytics
    # Switched to timezone-aware UTC for consistency across the Engine
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # 4. Relationship (The Database Glue)
    owner = relationship("User", back_populates="portfolio")

    @property
    def monthly_surplus(self):
        """Calculates investable cash flow."""
        return round(self.monthly_income - self.monthly_expenses, 2)

    @property
    def net_worth(self):
        """Total liquidity snapshot."""
        return round(self.savings + self.investments, 2)

    def __repr__(self):
        return f"<Portfolio(owner={self.owner_email}, net_worth={self.net_worth})>"