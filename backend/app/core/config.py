from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # --- App Identity ---
    APP_NAME: str = "FinancePro AI Authority"
    VERSION: str = "2.5.0"
    
    # --- AI & Intelligence ---
    # Optional allows the app to start even if you haven't set the key yet
    GEMINI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # --- Infrastructure (Database) ---
    # Defaulting to a local PostgreSQL structure to prevent startup crashes
    DATABASE_URL: str = "postgresql://postgres:mypassword@localhost:5432/aifinance"
    
    # --- Authentication (OAuth) ---
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/auth/google/callback"
    
    # --- Security & Encryption ---
    # Never use a real secret here; always pull from .env in production
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 Days
    
    class Config:
        env_file = ".env"
        extra = "ignore" # Ignores extra variables in .env without crashing

@lru_cache()
def get_settings():
    return Settings()

# Global instance for easy import: from app.core.config import settings
settings = get_settings()