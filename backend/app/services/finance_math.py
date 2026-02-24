def calculate_sip(amount: float, rate: float, years: int, step_up_percent: float = 0.0, inflation_rate: float = 6.0) -> dict:
    """
    Advanced SIP Logic with Inflation Adjustment and 2024-25 LTCG Tax estimation.
    """
    # 0. Failsafe for empty or invalid inputs
    if amount <= 0 or years <= 0:
        return {
            "total_invested": 0, "estimated_returns": 0, "total_value": 0,
            "post_tax_value": 0, "estimated_tax": 0, "inflation_adjusted_value": 0,
            "chart_data": [{"year": 0, "invested": 0, "value": 0, "real_value": 0}]
        }

    # 1. Parameter Normalization
    monthly_rate = rate / 12 / 100
    months = int(years * 12)
    
    total_invested = 0.0
    current_value = 0.0
    investment_details = []
    current_monthly = float(amount)
    
    # Inject Year 0 so the frontend Recharts graph starts cleanly from origin
    investment_details.append({
        "year": 0,
        "invested": 0,
        "value": 0,
        "real_value": 0
    })
    
    # 2. Iterative Compounding Loop
    for month in range(1, months + 1):
        # Apply Yearly Step-up at the start of each new year (Month 13, 25, 37...)
        if month > 1 and month % 12 == 1:
            current_monthly += (current_monthly * step_up_percent / 100)
            
        total_invested += current_monthly
        # Standard SIP Future Value Formula: (FV + P) * (1 + i)
        current_value = (current_value + current_monthly) * (1 + monthly_rate)
        
        # 3. Capture Yearly Data for Frontend Charts
        if month % 12 == 0:
            elapsed_years = month // 12
            
            # Inflation Factor calculation to determine actual purchasing power
            inflation_factor = (1 + (inflation_rate / 100)) ** elapsed_years
            real_value = current_value / inflation_factor
            
            investment_details.append({
                "year": elapsed_years,
                "invested": int(round(total_invested)),
                "value": int(round(current_value)),
                "real_value": int(round(real_value)) 
            })
            
    # 4. Taxation Logic (Indian Finance Act 2024-25)
    # LTCG on Equity: 12.5% on gains exceeding ₹1.25 Lakh per year
    total_gains = current_value - total_invested
    tax_exemption_limit = 125000.0
    tax_rate = 0.125
    
    taxable_gains = max(0.0, total_gains - tax_exemption_limit)
    estimated_tax = taxable_gains * tax_rate
    post_tax_value = current_value - estimated_tax

    return {
        "total_invested": int(round(total_invested)),
        "estimated_returns": int(round(total_gains)),
        "total_value": int(round(current_value)),
        "post_tax_value": int(round(post_tax_value)),
        "estimated_tax": int(round(estimated_tax)),
        "inflation_adjusted_value": int(round(investment_details[-1]["real_value"])) if investment_details else 0,
        "chart_data": investment_details
    }


def calculate_runway(savings: float, monthly_expenses: float) -> float:
    """
    Calculates the 'Financial Runway' (Emergency Fund Coverage).
    """
    if monthly_expenses <= 0:
        return 999.0 
    return round(float(savings) / float(monthly_expenses), 1)