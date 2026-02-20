import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
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

# Global Schema Sync - Ensures all tables (Portfolio, History, Goals) are mapped
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinancePro AI - Authority Engine",
    version="3.0.0",
    description="Quantum Finance Intelligence Layer"
)

# Security: CORS Policy optimized for Vite + FastAPI Handshake
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
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
    email: str
    title: str
    target_amount: float
    category: str
    current_amount: float = 0.0

# --- 1. AUTHORITY IDENTITY PROTOCOLS ---

@app.get("/")
def engine_health():
    """System Vitality Check"""
    return {"status": "Operational", "engine": "FastAPI + Llama 3.2"}

@app.post("/api/register")
def create_account(user: UserAuth, db: Session = Depends(get_db)):
    """Initialize New Authority Node"""
    email_normalized = user.email.lower().strip()
    
    if db.query(User).filter(User.email == email_normalized).first():
        raise HTTPException(status_code=400, detail="Authority record already exists.")
    
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

# --- 1.5 GOOGLE OAUTH INFRASTRUCTURE ---

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

@app.get("/api/auth/google/login")
async def google_login_entry():
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google Client ID missing.")
    
    google_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}&response_type=code"
        f"&scope=openid%20email%20profile&prompt=select_account"
    )
    return RedirectResponse(url=google_url)

@app.get("/api/auth/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET, "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        access_token = token_res.json().get("access_token")
        
        user_res = await client.get("https://www.googleapis.com/oauth2/v1/userinfo", 
                                    headers={"Authorization": f"Bearer {access_token}"})
        email = user_res.json().get("email").lower().strip()

        db_user = db.query(User).filter(User.email == email).first()
        if not db_user:
            db_user = User(email=email, role="student", level="beginner")
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

        internal_token = create_access_token({"sub": email})
        return RedirectResponse(url=f"http://localhost:5173/auth-success?token={internal_token}&email={email}")

# --- 2. GOAL ARCHITECTURE (INTEGRATED) ---

@app.post("/api/goals/create")
def establish_goal(goal_data: GoalCreate, db: Session = Depends(get_db)):
    email_normalized = goal_data.email.lower().strip()
    
    # This is where your 404 is triggering!
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
            category=goal_data.category
        )
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        return {"status": "Objective Established", "id": new_goal.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Handshake Failure: {str(e)}")

@app.get("/api/goals")
def list_objectives(email: str, db: Session = Depends(get_db)):
    return db.query(Goal).filter(Goal.user_email == email.lower().strip()).all()

@app.post("/api/goals/inject")
def inject_capital(goal_id: int, amount: float, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Objective node not found.")
    
    goal.current_amount += amount
    db.commit()
    db.refresh(goal)
    return {"status": "Capital Injected", "new_balance": goal.current_amount}

@app.delete("/api/goals/{goal_id}")
def terminate_goal(goal_id: int, email: str, db: Session = Depends(get_db)):
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_email == email.lower().strip()).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Objective not found or access denied.")
    try:
        db.delete(goal)
        db.commit()
        return {"status": "Objective Terminated", "id": goal_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database Termination Failure")


# --- 3. INTELLIGENCE & ANALYTICS ---

@app.get("/api/market-status")
def market_intel():
    return get_nifty_analysis()

@app.post("/api/ai/chat")
async def intelligence_protocol(request: ChatRequest, db: Session = Depends(get_db)):
    advice = get_ai_finance_advice(db, request.email, request.query)
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

@app.get("/api/analytics/comprehensive")
def dashboard_intelligence(email: str, db: Session = Depends(get_db)):
    return get_comprehensive_stats(db, email.lower())

# --- 4. PORTFOLIO SYNC & PROJECTION ---

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

@app.get("/api/calculate-sip")
def sip_projection(amount: float, rate: float, years: int, step_up: float = 0):
    return calculate_sip(amount, rate, years, step_up_percent=step_up)