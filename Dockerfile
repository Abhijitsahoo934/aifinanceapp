# ... (Starting lines same rahengi)

# --- STAGE 1: Build the React Frontend ---
# ...
COPY frontend/ .
# DELETE KIYA: COPY .env .env  <-- Ye line hata di
RUN npm run build

# --- STAGE 2: Build the Python Backend ---
# ...
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
# DELETE KIYA: COPY .env .env  <-- Ye line bhi hata di
COPY --from=frontend-builder /frontend/dist ./static
# ... (Baki sab same)