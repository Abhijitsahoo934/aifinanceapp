import ollama
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.goal import Goal
from ollama import Client

def get_ai_finance_advice(db: Session, user_email: str, user_query: str):
    try:
        # 1. Initialize explicit local client (Ensures connection to Port 11434)
        client = Client(host='http://localhost:11434')

        # 2. Fetch User with Case-Insensitivity Check
        # .lower() prevents 'User@Gmail.com' mismatching with 'user@gmail.com'
        normalized_email = user_email.lower()
        user = db.query(User).filter(User.email == normalized_email).first()
        
        # Identity Fallbacks
        user_role = getattr(user, 'role', 'student') if user else 'student'
        user_level = getattr(user, 'level', 'beginner') if user else 'beginner'

        # 3. Fetch Financial Context
        portfolio = db.query(Portfolio).filter(Portfolio.owner_email == normalized_email).first()
        goals = db.query(Goal).filter(Goal.user_email == normalized_email).all()

        income = portfolio.monthly_income if portfolio else 0
        expenses = portfolio.monthly_expenses if portfolio else 0
        savings = portfolio.savings if portfolio else 0
        investments = portfolio.investments if portfolio else 0
        surplus = income - expenses

        # 4. Construct Data-Driven System Context
        financial_summary = f"""
        PROFILE: {user_role.upper()} | LEVEL: {user_level.upper()}
        MONTHLY INCOME: ₹{income}
        MONTHLY EXPENSES: ₹{expenses}
        INVESTABLE SURPLUS: ₹{surplus}
        SAVINGS: ₹{savings} | INVESTMENTS: ₹{investments}
        ACTIVE GOALS: {", ".join([g.title for g in goals]) if goals else "None set."}
        """

        system_context = (
            "You are 'FinancePro AI', an expert Indian Wealth Management Consultant. "
            "Use the provided user context to give precise, mathematically-backed financial advice. "
            f"\n--- USER FINANCIAL DATA ---\n{financial_summary}\n---------------------------\n"
            "INSTRUCTIONS:\n"
            "1. Currency: Always use INR (₹), Lakhs, and Crores.\n"
            "2. Context: Apply Indian tax laws (e.g., 80C, LTCG/STCG) and investment instruments (PPF, SIP, ELSS).\n"
            "3. Tone: Professional, encouraging, and authoritative.\n"
            "4. Structure: Use Markdown. Format as: Summary ->  Strategy -> Risk Warning."
        )

        # 5. Execute Llama 3.2 Reasoning
        response = client.chat(model='llama3.2', messages=[
            {'role': 'system', 'content': system_context},
            {'role': 'user', 'content': user_query},
        ])
        
        return response['message']['content']

    except Exception as e:
        return (
            f"⚠️ [INTELLIGENCE LINK ERROR]\n"
            f"Ensure Ollama is running (Check system tray icon).\n"
            f"Verify 'llama3.2' is downloaded (Run 'ollama pull llama3.2').\n"
            f"Debug Info: {str(e)}"
        )