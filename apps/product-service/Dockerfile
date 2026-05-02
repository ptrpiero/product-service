# Build context: monorepo root
# ── Stage 1: install all workspace deps ──────────────────────────────────────
FROM node:24-alpine AS installer

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/product-service/package.json ./apps/product-service/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM installer AS builder

COPY apps/product-service/ ./apps/product-service/

RUN pnpm --filter @product-service/app build

# ── Stage 3: deploy (prune to prod-only deps) ─────────────────────────────────
FROM node:24-alpine AS deployer

RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

WORKDIR /app

COPY --from=builder /app ./

RUN pnpm --filter @product-service/app deploy --prod /deploy/product-service

# ── Stage 4: minimal production runner ───────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=deployer /deploy/product-service ./

EXPOSE 3000

CMD ["node", "dist/main"]
