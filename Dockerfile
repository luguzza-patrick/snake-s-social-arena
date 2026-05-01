# Stage 1: Build the frontend
FROM node:20-slim AS frontend-build

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final image
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy backend dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy backend source code
COPY backend/ .

# Copy frontend build artifacts to the static directory
COPY --from=frontend-build /frontend/dist ./static

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["uv", "run", "python", "main.py"]
