from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio
from app.models.goal import Goal
from app.services.finance_math import calculate_sip

def calculate_health_score(savings: float, expenses: float, income: float) -> int:
    """
    Authority Logic: Generates a stability index (0-100).
    - 40% Savings Ratio: Rewards high surplus-to-income performance.
    - 40% Runway: Target 6 months of liquid emergency coverage.
    - 20% Expense Discipline: Penalties for expense ratios exceeding 50%.
    """
    if income <= 0: return 0 #
    
    # 1. Savings Rate Score (40 Points)
    surplus = income - expenses #
    savings_rate = (surplus / income) * 100 #
    # Full 40 points granted at a 20% savings rate
    rate_score = min(max(savings_rate * 2, 0), 40) 
    
    # 2. Runway/Emergency Fund Score (40 Points)
    if expenses <= 0:
        runway_score = 40 #
    else:
        months_covered = savings / expenses #
        # Full 40 points granted at 6 months of coverage
        runway_score = min((months_covered / 6) * 40, 40) 
    
    # 3. Expense Control Score (20 Points)
    expense_ratio = (expenses / income) #
    if expense_ratio <= 0.5:
        ratio_score = 20 #
    elif expense_ratio <= 0.8:
        ratio_score = 10 #
    else:
        ratio_score = 0 #
    
    return int(rate_score + runway_score + ratio_score) #

def get_comprehensive_stats(db: Session, email: str):
    """
    Aggregates database metrics into a unified Financial Vitality Audit.
    """
    normalized_email = email.lower().strip() #

    # 1. Data Retrieval
    portfolio = db.query(Portfolio).filter(Portfolio.owner_email == normalized_email).first()
    active_goals = db.query(Goal).filter(Goal.user_email == normalized_email, Goal.status == "active").all()
    
    if not portfolio:
        return {
            "summary": {"health_score": 0, "net_worth": 0, "monthly_surplus": 0},
            "status": "No Authority Record Found"
        } #

    # 2. Financial Metrics
    surplus = portfolio.monthly_income - portfolio.monthly_expenses
    total_net_worth = portfolio.savings + portfolio.investments
    
    # 3. Objective Progress
    total_goal_target = sum(g.target_amount for g in active_goals)
    total_goal_current = sum(g.current_amount for g in active_goals)
    
    goal_completion_pct = (total_goal_current / total_goal_target * 100) if total_goal_target > 0 else 0

    # 4. Wealth Strategy Projection (12% CAGR Target)
    # Using the monthly surplus as a simulated SIP contribution
    projection = calculate_sip(max(surplus, 0), 12.0, 10) 
    
    # 5. Calibration
    health_score = calculate_health_score(
        portfolio.savings, 
        portfolio.monthly_expenses, 
        portfolio.monthly_income
    )

    # 6. Structured Output
    return {
        "summary": {
            "net_worth": round(total_net_worth, 2),
            "monthly_surplus": round(surplus, 2),
            "health_score": health_score,
            "emergency_fund_months": round(portfolio.savings / portfolio.monthly_expenses, 1) if portfolio.monthly_expenses > 0 else 12.0
        },
        "goals": {
            "count": len(active_goals),
            "completion_percentage": round(goal_completion_pct, 2),
            "shortfall": round(max(total_goal_target - total_goal_current, 0), 2)
        },
        "projections": {
            "ten_year_total": round(projection["total_value"], 2),
            "chart_data": projection["chart_data"]
        },
        "insights": "EXCELLENT" if health_score > 80 else ("STABLE" if health_score > 50 else "CRITICAL")
    } #