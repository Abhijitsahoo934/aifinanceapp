import os
import httpx
import secrets
from datetime import date
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

# Core & Database Infrastructure
from app.core.database import engine, Base, get_db, verify_db_connection
from app.core.security import (
    get_password_hash, 
    verify_password, 
    create_access_token
)

# Advanced Authority Models
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.history import ChatHistory
from app.models.goal import Goal

# Intelligent Engine Services
from app.services.ai_service import get_ai_finance_advice 
from app.services.analytics import get_comprehensive_stats
from app.services.finance_math import calculate_sip
from app.services.market_engine import get_nifty_analysis 

# --- SYSTEM INITIALIZATION ---
load_dotenv()

# Global Schema Sync - Ensures all tables are mapped in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinancePro AI - Authority Engine",
    version="4.0.0",
    description="Quantum Finance Intelligence Layer"
)

# Security: CORS Policy optimized to prevent "Backend connection failed" errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Vite Dev
        "http://127.0.0.1:5173",    # Vite Dev Alternate
        "http://localhost:8000",    # Docker Localhost
        "http://127.0.0.1:8000",    # Docker IP
        "https://financepro-latest-3.onrender.com" # Live Production URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STARTUP PROTOCOL ---
@app.on_event("startup")
async def startup_event():
    """Verify Database Connectivity on Boot"""
    verify_db_connection()


# --- VALIDATION SCHEMAS ---
class UserAuth(BaseModel):
    email: str
    password: str

class PortfolioUpdate(BaseModel):
    email: str
    income: float
    expenses: float
    savings: float
    investments: float = 0.0

class ChatRequest(BaseModel):
    query: str
    email: str

class GoalCreate(BaseModel):
    user_email: str
    title: str
    target_amount: float
    category: str
    current_amount: float = 0.0
    deadline: Optional[date] = None 

class PersonaUpdate(BaseModel):
    email: str
    role: str
    level: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


# --- 1. AUTHORITY IDENTITY PROTOCOLS ---

@app.get("/api/health")
def engine_health():
    """System Vitality Check"""
    return {"status": "Operational", "engine": "FastAPI + PostgreSQL Architecture"}

@app.post("/api/register")
def create_account(user: UserAuth, db: Session = Depends(get_db)):
    """Initialize New Authority Node"""
    email_normalized = user.email.lower().strip()
    
    if db.query(User).filter(User.email == email_normalized).first():
        raise HTTPException(status_code=400, detail="Authority record already exists.")
    
    # SECURITY FIX: Bcrypt 72-byte limit protection
    if len(user.password) > 72:
        raise HTTPException(status_code=400, detail="Password too long (Max 72 characters)")
    
    new_user = User(
        email=email_normalized, 
        hashed_password=get_password_hash(user.password),
        role="student",
        level="beginner"
    )
    db.add(new_user)
    db.commit()
    return {
        "status": "Authorized", 
        "token": create_access_token({"sub": email_normalized})
    }

@app.post("/api/login")
def authorize_session(user: UserAuth, db: Session = Depends(get_db)):
    """Session Handshake and JWT Generation"""
    email_normalized = user.email.lower().strip()
    db_user = db.query(User).filter(User.email == email_normalized).first()
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    return {
        "token": create_access_token({"sub": db_user.email}),
        "email": db_user.email,
        "role": db_user.role,
        "level": db_user.level
    }

@app.post("/api/user/update-persona")
def update_user_persona(data: PersonaUpdate, db: Session = Depends(get_db)):
    """Permanent Identity Calibration in PostgreSQL"""
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Identity node not found.")
    
    user.role = data.role
    user.level = data.level
    
    db.commit()
    db.refresh(user)
    return {"status": "Identity Calibrated", "role": user.role, "level": user.level}

@app.post("/api/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Finalizes the new security phrase."""
    email_normalized = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_normalized).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Identity node not found.")
    
    if len(req.new_password) > 72:
        raise HTTPException(status_code=400, detail="Password too long (Max 72 characters)")
        
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"status": "Security Phrase Updated Successfully"}


# --- 1.5 GOOGLE OAUTH INFRASTRUCTURE ---

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

@app.get("/api/auth/google/login")
async def google_login_entry():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID missing in environment.")
    
    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}&response_type=code"
        f"&scope=openid%20email%20profile&prompt=select_account"
    )
    return RedirectResponse(url=google_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        # Step 1: Exchange code for access token
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code, 
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET, 
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        token_data = token_res.json()
        
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail=f"Google Token Error: {token_data}")
            
        access_token = token_data.get("access_token")
        
        # Step 2: Get user info using the access token
        user_res = await client.get("https://www.googleapis.com/oauth2/v1/userinfo", 
                                    headers={"Authorization": f"Bearer {access_token}"})
        user_info = user_res.json()
        
        raw_email = user_info.get("email")
        if not raw_email:
             raise HTTPException(status_code=400, detail=f"Google UserInfo Error: {user_info}")
        
        email = raw_email.lower().strip()
        db_user = db.query(User).filter(User.email == email).first()
        
        if not db_user:
            # Generate safe 32-byte password to bypass Bcrypt 72-byte limit
            safe_generated_password = secrets.token_urlsafe(32)
            db_user = User(
                email=email, 
                hashed_password=get_password_hash(safe_generated_password),
                role="professional", 
                level="intermediate", 
                is_verified=True
            )
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

        internal_token = create_access_token({"sub": email})
        
        # Redirect to frontend with auth details
        return RedirectResponse(
            url=f"/?auth_token={internal_token}&email={email}&role={db_user.role}&level={db_user.level}"
        )

# --- 2. GOAL ARCHITECTURE ---

@app.post("/api/goals")
def establish_goal(goal_data: GoalCreate, db: Session = Depends(get_db)):
    email_normalized = goal_data.user_email.lower().strip()
    user = db.query(User).filter(User.email == email_normalized).first()
    if not user:
        raise HTTPException(status_code=404, detail="Identity node not found.")

    try:
        new_goal = Goal(
            user_id=user.id, 
            user_email=email_normalized,
            title=goal_data.title,
            target_amount=goal_data.target_amount,
            current_amount=goal_data.current_amount,
            category=goal_data.category,
            deadline=goal_data.deadline  
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return {"status": "Objective Established", "id": new_goal.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database Handshake Failure: {str(e)}")

@app.get("/api/goals")
def list_objectives(email: str, db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_email == email.lower().strip()).all()


# --- 3. INTELLIGENCE & ANALYTICS ---

@app.get("/api/market-status")
def market_intel():
    return get_nifty_analysis()

@app.post("/api/ai/chat")
async def intelligence_protocol(request: ChatRequest, db: Session = Depends(get_db)):
    advice = await get_ai_finance_advice(db, request.email, request.query)
    user = db.query(User).filter(User.email == request.email.lower()).first()
    new_chat = ChatHistory(
        user_id=user.id if user else None,
        user_email=request.email.lower(), 
        query=request.query, 
        response=advice
    )
    db.add(new_chat)
    db.commit()
    return {"response": advice}

# --- MISSING ENDPOINT RESTORED: COMPREHENSIVE STATS ---
@app.get("/api/analytics/comprehensive")
def dashboard_intelligence(email: str, db: Session = Depends(get_db)):
    return get_comprehensive_stats(db, email.lower().strip())


# --- 4. PORTFOLIO SYNC & PROJECTIONS ---

@app.post("/api/portfolio/sync")
def sync_financial_data(data: PortfolioUpdate, db: Session = Depends(get_db)):
    email_normalized = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_normalized).first()
    if not user:
        raise HTTPException(status_code=404, detail="Authority identity not found.")
        
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user.id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user.id, owner_email=email_normalized)
        db.add(portfolio)
    
    portfolio.monthly_income = data.income
    portfolio.monthly_expenses = data.expenses
    portfolio.savings = data.savings
    portfolio.investments = data.investments
    db.commit()
    return {"status": "Quantum Sync Complete"}

# --- MISSING ENDPOINT RESTORED: SIP CALCULATOR ---
@app.get("/api/calculate-sip")
def sip_projection(amount: float, rate: float, years: int, step_up: float = 0):
    return calculate_sip(amount, rate, years, step_up_percent=step_up)


# --- 5. UNIFIED FRONTEND SERVING ---

if os.path.exists("static/assets"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    index_path = "static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"error": "Frontend UI is building or static files are missing."}