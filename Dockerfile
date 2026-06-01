FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build && pnpm seed

ENV NODE_ENV=production
ENV PORT=10000
ENV DB_PATH=/var/data/ddrs.sqlite

EXPOSE 10000

RUN chmod +x /app/scripts/docker-entrypoint.sh

CMD ["/app/scripts/docker-entrypoint.sh"]
