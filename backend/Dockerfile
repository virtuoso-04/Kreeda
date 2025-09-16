FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgl1 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/app/ ./app/

# Create data directories
RUN mkdir -p data/videos data/overlays data/results

# Install overlay dependencies
WORKDIR /app/overlay
COPY overlay/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install dashboard dependencies
WORKDIR /app/dashboard
COPY dashboard/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install mobile dependencies
WORKDIR /app/mobile
COPY mobile/package.json .
COPY mobile/package-lock.json .
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install --legacy-peer-deps

# Expose port for backend
EXPOSE 8000

# Default command to run the backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]