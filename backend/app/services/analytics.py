import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.models.portfolio import Portfolio
from app.models.goal import Goal
from app.services.finance_math import calculate_sip

# Initialize Authority Logger
logger = logging.getLogger(__name__)

def calculate_health_score(savings: float, expenses: float, income: float) -> int:
    """
    Authority Logic: Generates a financial stability index (0-100).
    - 40% Savings Ratio: Rewards high surplus-to-income performance.
    - 40% Runway: Target 6 months of liquid emergency coverage.
    - 20% Expense Discipline: Penalties for expense ratios exceeding 50%.
    """
    try:
        # Failsafe: Cannot calculate metrics without income
        if income <= 0: 
            return 0 
        
        # 1. Savings Rate Score (Max 40 Points)
        surplus = income - expenses
        savings_rate = (surplus / income) * 100
        # Full 40 points granted at a 20% savings rate (2 points per 1%)
        rate_score = min(max(savings_rate * 2, 0), 40.0) 
        
        # 2. Runway/Emergency Fund Score (Max 40 Points)
        if expenses <= 0:
            runway_score = 40.0 # Perfect score if no expenses
        else:
            months_covered = savings / expenses
            # Full 40 points granted at 6 months of coverage
            runway_score = min((months_covered / 6.0) * 40.0, 40.0) 
        
        # 3. Expense Control Score (Max 20 Points)
        expense_ratio = (expenses / income)
        if expense_ratio <= 0.5:
            ratio_score = 20.0 # Excellent discipline
        elif expense_ratio <= 0.8:
            ratio_score = 10.0 # Average discipline
        else:
            ratio_score = 0.0  # Critical warning
        
        return int(rate_score + runway_score + ratio_score)

    except Exception as e:
        logger.error(f"Health Score Calculation Error: {str(e)}")
        return 0

def get_comprehensive_stats(db: Session, email: str) -> dict:
    """
    Aggregates database metrics into a unified Financial Vitality Audit.
    Guarantees perfect payload formatting for Recharts frontend ingestion.
    """
    normalized_email = email.lower().strip()

    try:
        # 1. Secure Data Retrieval
        portfolio = db.query(Portfolio).filter(Portfolio.owner_email == normalized_email).first()
        active_goals = db.query(Goal).filter(Goal.user_email == normalized_email).all()
        
        # Immediate fallback mapping if identity lacks financial data
        if not portfolio:
            return {
                "summary": {"health_score": 0, "net_worth": 0, "monthly_surplus": 0, "emergency_fund_months": 0},
                "goals": {"completion_percentage": 0, "count": 0, "shortfall": 0},
                "projections": {"chart_data": [], "ten_year_total": 0},
                "status": "No Authority Record Found"
            }

        # Ensure values default to 0.0 if empty to prevent TypeErrors
        p_income = float(portfolio.monthly_income or 0.0)
        p_expenses = float(portfolio.monthly_expenses or 0.0)
        p_savings = float(portfolio.savings or 0.0)
        p_investments = float(portfolio.investments or 0.0)

        # 2. Financial Core Metrics
        surplus = p_income - p_expenses
        total_net_worth = p_savings + p_investments
        
        # 3. Objective Progress Matrix
        total_goal_target = sum(float(g.target_amount or 0.0) for g in active_goals)
        total_goal_current = sum(float(g.current_amount or 0.0) for g in active_goals)
        
        goal_completion_pct = (total_goal_current / total_goal_target * 100) if total_goal_target > 0 else 0.0

        # 4. Wealth Strategy Projection (12% CAGR Target) -> Native formatting for Recharts
        investable_surplus = max(surplus, 0.0)
        chart_data = []
        projected_value = total_net_worth
        
        for year in range(1, 11):
            # Add annual surplus to principal, then compound by 12%
            annual_contribution = investable_surplus * 12
            projected_value = (projected_value + annual_contribution) * 1.12
            
            chart_data.append({
                "year": f"Y{year}",
                "value": round(projected_value)
            })
        
        # 5. Vitality Calibration
        health_score = calculate_health_score(p_savings, p_expenses, p_income)
        emergency_months = round(p_savings / p_expenses, 1) if p_expenses > 0 else 12.0

        # 6. Structured Quantum Output
        return {
            "summary": {
                "net_worth": round(total_net_worth, 2),
                "monthly_surplus": round(surplus, 2),
                "health_score": health_score,
                "emergency_fund_months": emergency_months
            },
            "goals": {
                "count": len(active_goals),
                "completion_percentage": round(goal_completion_pct, 1),
                "shortfall": round(max(total_goal_target - total_goal_current, 0), 2)
            },
            "projections": {
                "ten_year_total": round(projected_value, 2),
                "chart_data": chart_data
            },
            "insights": "EXCELLENT" if health_score >= 80 else ("STABLE" if health_score >= 50 else "CRITICAL"),
            "status": "Success"
        }

    except SQLAlchemyError as db_err:
        logger.error(f"Database Query Failure in Analytics: {str(db_err)}")
        # Provide safe fallback architecture so frontend doesn't crash
        return {"status": "Database Error", "summary": {"health_score": 0}, "projections": {"chart_data": []}}
    except Exception as e:
        logger.error(f"Unexpected Analytics Engine Failure: {str(e)}")
        return {"status": "System Error", "summary": {"health_score": 0}, "projections": {"chart_data": []}}