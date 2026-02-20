import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# --- Configuration ---
# Integrated with centralized settings
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# --- Password Hashing ---
# Uses bcrypt for high-security password storage
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hashes a plain text password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

# --- Token Logic ---

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generates a secure JWT access token."""
    to_encode = data.copy()
    
    # NEW: Use timezone-aware UTC to prevent "Identity not found" / Token errors
    now = datetime.now(timezone.utc)
    
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Encode the JWT
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token(email: str):
    """Generates a short-lived token for password resets (15 mins)."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=15)
    to_encode = {
        "exp": expire, 
        "sub": email, 
        "type": "password_reset",
        "iat": now 
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    """Decodes and validates tokens with proper error handling."""
    try:
        # Standard decoding logic
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # If token is expired or tampered with, it returns None
        return None