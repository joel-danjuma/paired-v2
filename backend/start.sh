#!/bin/sh

set -e

# Run database migrations
echo "Running database migrations..."
if alembic upgrade head; then
    echo "Migrations successful"
else
    echo "Migrations failed"
    exit 1
fi

# Start the application
echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 