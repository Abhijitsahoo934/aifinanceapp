import os
import logging
from sqlalchemy.orm import Session
from groq import AsyncGroq

from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.goal import Goal

# Initialize Authority Logger
logger = logging.getLogger(__name__)

# Initialize the Groq Async Client
# It automatically pulls the GROQ_API_KEY from your .env file
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))

async def get_ai_finance_advice(db: Session, user_email: str, user_query: str) -> str:
    try:
        # 1. Fetch User with Case-Insensitivity Check
        normalized_email = user_email.lower().strip()
        user = db.query(User).filter(User.email == normalized_email).first()
        
        # Identity Fallbacks
        user_role = getattr(user, 'role', 'student') if user else 'student'
        user_level = getattr(user, 'level', 'beginner') if user else 'beginner'

        # 2. Fetch Financial Context
        portfolio = db.query(Portfolio).filter(Portfolio.owner_email == normalized_email).first()
        goals = db.query(Goal).filter(Goal.user_email == normalized_email).all()

        income = portfolio.monthly_income if portfolio else 0
        expenses = portfolio.monthly_expenses if portfolio else 0
        savings = portfolio.savings if portfolio else 0
        investments = portfolio.investments if portfolio else 0
        surplus = income - expenses

        # 3. Construct Data-Driven System Context
        financial_summary = f"""
        PROFILE: {user_role.upper()} | LEVEL: {user_level.upper()}
        MONTHLY INCOME: ₹{income}
        MONTHLY EXPENSES: ₹{expenses}
        INVESTABLE SURPLUS: ₹{surplus}
        SAVINGS: ₹{savings} | INVESTMENTS: ₹{investments}
        ACTIVE GOALS: {", ".join([g.title for g in goals]) if goals else "None set."}
        """

        system_context = (
            "You are 'FinancePro AI', an elite, highly intelligent Indian Wealth Management Consultant. "
            "Use the provided user context to give precise, mathematically-backed financial advice. "
            f"\n--- USER FINANCIAL DATA ---\n{financial_summary}\n---------------------------\n"
            "INSTRUCTIONS:\n"
            "1. Currency: Always use INR (₹), Lakhs, and Crores.\n"
            "2. Context: Apply Indian tax laws (e.g., 80C, LTCG/STCG) and investment instruments (PPF, SIP, ELSS).\n"
            "3. Tone: Professional, encouraging, and authoritative. Never break character.\n"
            "4. Structure: Use Markdown. Format as: Summary -> Strategy -> Risk Warning."
        )

        # 4. Execute Cloud-Based Llama Reasoning via Groq
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": user_query}
            ],
            # 🚀 FIXED: Updated to the latest active Groq Llama model
            model="llama-3.3-70b-versatile", 
            temperature=0.5,
            max_tokens=1024,
        )
        
        return chat_completion.choices[0].message.content

    except Exception as e:
        logger.error(f"Cloud Intelligence Failure: {str(e)}")
        return (
            "⚠️ **[SYSTEM OVERLOAD]**: Cloud Intelligence Node (Groq) is currently unresponsive.\n\n"
            "**Diagnostics:**\n"
            "- Ensure `GROQ_API_KEY` is correctly set in your backend `.env` file or Docker environment.\n"
            f"- Error trace: `{str(e)}`"
        )