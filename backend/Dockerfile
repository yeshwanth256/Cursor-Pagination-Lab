# Use the official lightweight Python 3.12 image
FROM python:3.12-slim

# Prevent Python from writing .pyc files to disk and enable line buffering for logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (e.g., libpq for PostgreSQL connectivity)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port (Render automatically maps this, defaulting to 8000 or the PORT env var)
EXPOSE 8000

# Start FastAPI via Uvicorn, binding to all interfaces and the port environment variable
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
