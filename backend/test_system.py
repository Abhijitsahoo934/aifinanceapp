import requests
import sys

BASE_URL = "http://127.0.0.1:8000"
TEST_EMAIL = "abhijitsahoo2024@gift.edu.in"

def run_tests():
    print(f"🚀 Initializing Authority Engine Audit...")
    print("-" * 50)

    # 1. Health Check
    try:
        res = requests.get(f"{BASE_URL}/")
        print(f"✅ [BACKEND]: {res.json().get('status')} (Engine: {res.json().get('engine')})")
    except Exception:
        print("❌ [BACKEND]: Offline. Run 'uvicorn main:app --reload' first.")
        sys.exit()

    # 2. Market Intelligence Check
    try:
        res = requests.get(f"{BASE_URL}/api/market-status")
        data = res.json()
        if res.status_code == 200:
            print(f"✅ [MARKET]: {data['index']} @ {data['price']} ({data['status']})")
        else:
            print(f"❌ [MARKET]: {data.get('recommendation')}")
    except Exception as e:
        print(f"❌ [MARKET]: Logic Error. Debug: {e}")

    # 3. AI Advisor & Ollama Handshake
    try:
        print("⏳ [AI ADVISOR]: Querying Llama 3.2 (This may take a moment)...")
        res = requests.post(f"{BASE_URL}/api/ai/chat", json={
            "query": "Hello, explain my current financial status.",
            "email": TEST_EMAIL
        })
        data = res.json()
        if "response" in data:
            print(f"✅ [AI ADVISOR]: Connected. Response received ({len(data['response'])} chars)")
            # Check for identity error in the string
            if "Identity not found" in data['response']:
                print("⚠️ [IDENTITY]: Warning - Test email not found in PostgreSQL.")
        else:
            print(f"❌ [AI ADVISOR]: {data}")
    except Exception as e:
        print(f"❌ [AI ADVISOR]: Handshake failed. Ensure Ollama is running. {e}")

    # 4. Analytics & Database Link
    try:
        res = requests.get(f"{BASE_URL}/api/analytics/comprehensive?email={TEST_EMAIL}")
        if res.status_code == 200:
            print(f"✅ [ANALYTICS]: Database Link Active. Health Score: {res.json()['summary']['health_score']}")
        else:
            print(f"⚠️ [ANALYTICS]: No portfolio found for {TEST_EMAIL}. Sync needed.")
    except Exception as e:
        print(f"❌ [ANALYTICS]: Query failed. {e}")

    print("-" * 50)
    print("🏁 Audit Complete.")

if __name__ == "__main__":
    run_tests()