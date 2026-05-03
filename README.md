# Product Service

Cloud-native REST API (NestJS) + Angular admin dashboard.

**API doc:** `<CloudFrontUrl>/api-doc`  
**Dashboard:** `<CloudFrontUrl>`

## Stack

- NestJS 11 · Fastify · Sequelize · MySQL 8
- Angular 21 · Tailwind CSS
- AWS Lambda + API Gateway HTTP v2 · CloudFront + S3 · RDS · Cognito

## Monorepo

| Path | Description |
|------|-------------|
| `apps/product-service/` | NestJS API |
| `apps/dashboard/` | Angular dashboard |
| `infra/cdk/` | AWS CDK — VPC, RDS, Lambda, Cognito, API GW, CloudFront |
| `scripts/` | `deploy-frontend.ts` |

## Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install dependencies |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | E2e tests (Docker, exits when done) |
| `pnpm dev` | API + MySQL in Docker (watch mode → `:3000`) |
| `pnpm dev:dashboard` | Angular dev server (`:4200`, auth bypassed) |
| `pnpm deploy` | Deploy all CDK stacks to AWS |
| `pnpm deploy:frontend` | Build + S3 sync + CloudFront invalidation |

## Local dev

```bash
pnpm dev            # → http://localhost:3000
pnpm dev:dashboard  # → http://localhost:4200
```

## Deploy

```bash
# Bootstrap CDK once per account/region
cd infra/cdk && npx cdk bootstrap aws://ACCOUNT_ID/eu-west-1

# Deploy infra (Network → DB → Lambda → Frontend → Cognito → API GW)
pnpm deploy

# After first deploy: fill in apps/dashboard/src/environments/environment.prod.ts
# with ApiUrl, UserPoolId, UserPoolClientId from CDK outputs, then:
pnpm deploy:frontend
```

## Architecture

- **IaC with CDK** — all infrastructure defined as TypeScript (AWS CDK); six stacks: Network, Database, Lambda, Frontend, Cognito, API Gateway
- **Lambda over Docker** — migrated from ECS to Lambda (lower cost, scales to zero); Fastify `inject()` handles API GW HTTP v2 payload natively
- **Layered** — Controller → Service → `IProductsRepository` (abstract DI token) → `ProductsRepository` (Sequelize); Service never imports Sequelize
- **Auth at the edge** — Cognito JWT authorizer on API Gateway; NestJS has no auth logic; OPTIONS preflights bypass the authorizer for CORS
- **Swagger on CloudFront** — Lambda serves `/api-doc`; CloudFront behavior `/api-doc*` proxies to API Gateway; CDN assets via jsDelivr (esbuild can't bundle `swagger-ui-dist` statics)
