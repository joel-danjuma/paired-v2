FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy the startup script and make it executable
COPY start.sh .
RUN chmod +x ./start.sh

# Expose port
EXPOSE 8000

# Run the application using the startup script
CMD ["./start.sh"] 