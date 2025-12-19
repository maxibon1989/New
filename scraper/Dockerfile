# Python Scraping Pipeline Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy source code
COPY . .

# Create non-root user
RUN useradd -m -u 1001 scraper
USER scraper

# Default command - run all scrapers
CMD ["python", "main.py"]
