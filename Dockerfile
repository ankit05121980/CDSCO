# DDRS — single-image deployment (NestJS API + built React SPA on one port)
FROM node:22-bookworm-slim

# Build tools for the sqlite3 native module
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

# Install dependencies (leverages Docker layer caching)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN pnpm install

# Copy sources and build backend + frontend
COPY . .
RUN pnpm build

ENV NODE_ENV=production
ENV PORT=3001
ENV STATIC_ROOT=/app/frontend/dist
ENV DB_PATH=/app/data/ddrs.sqlite

# Persisted SQLite location (mount a volume here in production)
RUN mkdir -p /app/data

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
