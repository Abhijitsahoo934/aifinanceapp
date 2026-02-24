# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# 1. Install frontend dependencies
# We copy only package files first to leverage Docker caching
COPY frontend/package*.json ./
RUN npm install

# 2. Copy frontend source
COPY frontend/ .

# 3. CRITICAL FIX: Copy the root .env file into the frontend
# Vite NEEDS this file during build to bake the VITE_ variables into the JS code
COPY .env .env

# 4. Build static files
RUN npm run build


# ==========================================
# STAGE 2: Build the Python Backend
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# 5. Install system dependencies (Helps psycopg2-binary install smoothly)
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# 6. Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 7. Copy the backend code (main.py, models, etc.)
COPY backend/ .

# 8. Copy the root .env file so the backend has access to GOOGLE_CLIENT_SECRET
COPY .env .env

# 9. The "Magic" Step: 
# Copy the compiled React files (dist) from Stage 1 into a 'static' folder in the backend
COPY --from=frontend-builder /frontend/dist ./static

# 10. Expose the unified port
EXPOSE 8000

# 11. Ignite the FastAPI server
# This server will now handle both API calls and serve the static React site
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]