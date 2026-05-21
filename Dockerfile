# Stage 1: Build the React frontend
FROM node:18-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Flask backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if needed (e.g., for some python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Install gunicorn
RUN pip install --no-cache-dir gunicorn

COPY . .
# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/dist /app/dist

# Ensure the Flask app can find the dist folder if we decide to serve it
# but for now, we follow the existing structure.

ENV PORT 8080
EXPOSE 8080

# Use gunicorn to serve the Flask app
# We use the factory function create_app from the app package
CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 "app:create_app()"
