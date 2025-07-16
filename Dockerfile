# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package.json and lock files
COPY frontend/package.json frontend/package-lock.json* ./

# Install dependencies with npm
RUN npm install

# Copy the rest of the frontend code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the backend with the frontend assets
FROM python:3.10-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend dependency definitions
COPY backend/requirements.txt ./

# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend application code
COPY ./backend /app

# Copy the built frontend from the builder stage
COPY --from=frontend-builder /app/frontend/dist /app/static

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 