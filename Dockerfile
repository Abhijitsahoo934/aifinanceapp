# ==========================================
# STAGE 1: Build the React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# 1. Install frontend dependencies
COPY frontend/package*.json ./
RUN npm install

# 2. Copy frontend source and build static files
# Note: We don't copy .env here anymore; Render uses Dashboard variables
COPY frontend/ .
RUN npm run build

# ==========================================
# STAGE 2: Build the Python Backend
# ==========================================
FROM python:3.11-slim
WORKDIR /app

# 3. Install system dependencies for PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# 4. Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the backend code
COPY backend/ .

# 6. Copy compiled React files from Stage 1
COPY --from=frontend-builder /frontend/dist ./static

# 7. Expose the unified port
EXPOSE 8000

# 8. Ignite the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]