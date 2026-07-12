# AI-Powered Sign Language Learning & Assessment Platform - Backend
# Multi-stage build kept simple (single stage) since the app has no
# compiled frontend assets - just Python.

FROM python:3.12-slim

WORKDIR /app

# System deps needed by some ML/CV libraries (opencv, mediapipe) at runtime.
# Kept minimal; extend here if the AI/ML or Computer Vision teammate adds
# packages that need extra system libraries (e.g. libgl1 for opencv).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first for better layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app ./app

# Non-root user for security
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

# Basic container-level health check, matches /health in main.py
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
