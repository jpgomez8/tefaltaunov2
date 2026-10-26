FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace/database
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
COPY sql ./sql
COPY scripts ./scripts
COPY prisma.docker.config.ts ./

CMD ["node", "scripts/docker-setup.ts"]
