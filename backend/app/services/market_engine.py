import yfinance as yf
import pandas as pd
import numpy as np

def get_nifty_analysis():
    try:
        # 1. Data Fetching
        # Fetching Nifty 50 (^NSEI)
        nifty = yf.Ticker("^NSEI")
        # 5 days of 1-minute data for price accuracy, 6 months for SMA stability
        hist = nifty.history(period="6mo")
        
        if hist.empty or len(hist) < 20:
            return {
                "status": "OFFLINE", 
                "recommendation": "Market data feed interrupted. Check connection."
            }

        # 2. Extract Price Metrics
        # iloc[-1] is the most recent closing (or live) price
        current_price = hist['Close'].iloc[-1]
        prev_close = hist['Close'].iloc[-2]
        daily_change_pct = ((current_price - prev_close) / prev_close) * 100
        
        # 3. Moving Average Calculation
        # SMA20 is the industry standard for short-term trend identification
        hist['SMA20'] = hist['Close'].rolling(window=20).mean()
        current_sma = hist['SMA20'].iloc[-1]
        
        # 4. Momentum & Volatility Logic
        # Bullish if price stays above its 20-day average
        is_bullish_raw = current_price > current_sma
        
        # Calculate Drawdown (Drop from recent 20-day peak)
        recent_max = hist['High'].tail(20).max()
        drop_from_peak = ((recent_max - current_price) / recent_max) * 100

        # 5. Signal Generation Logic
        if drop_from_peak > 10:
            status = "BEARISH / CRASH"
            advice = "Significant drawdown detected. Historical data suggests this is a 'Buy the Dip' zone for long-term investors."
        elif not is_bullish_raw and daily_change_pct < -1.5:
            status = "VOLATILE"
            advice = "Short-term trend is weak with high volatility. Stick to your existing SIP; avoid large lump sums today."
        elif is_bullish_raw and drop_from_peak < 1.5:
            status = "BULLISH / PEAK"
            advice = "Market is trading near all-time highs. Maintain discipline; avoid 'FOMO' buying at these levels."
        else:
            status = "STABLE"
            advice = "Market is in a healthy consolidation phase. Your current investment strategy is optimal."

        # 6. Type-Safe Return for FastAPI Serialization
        # We cast everything to standard Python types (float, bool, str)
        return {
            "index": "NIFTY 50",
            "price": round(float(current_price), 2),
            "change_pct": f"{round(float(daily_change_pct), 2)}%",
            "sma_20": round(float(current_sma), 2),
            "status": str(status),
            "is_bullish": bool(is_bullish_raw), 
            "drawdown": round(float(drop_from_peak), 2),
            "recommendation": str(advice)
        }

    except Exception as e:
        # Fallback for unexpected API or calculation errors
        return {
            "status": "DATA_ERROR", 
            "recommendation": f"Market Intelligence Link Failed. Debug: {str(e)}"
        }