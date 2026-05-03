# Product Service Monorepo

pnpm workspace + Turborepo monorepo. NestJS e-commerce products API on AWS Lambda + API Gateway, Angular dashboard on CloudFront + S3.

## Structure

```
apps/product-service/   NestJS 11 products API (MySQL / Sequelize)
apps/dashboard/         Angular 21 admin dashboard (Tailwind CSS)
infra/cdk/              AWS CDK TypeScript — VPC, RDS, Lambda, Cognito, API Gateway, CloudFront
packages/               shared libs (reserved)
scripts/                monorepo utility scripts
```

## Prerequisites

- Node 24+, pnpm 10+
- Docker (for local dev / e2e)
- AWS CLI + credentials (for CDK deploy only)

## Install

```bash
pnpm install
```

## Scripts

All scripts run from the monorepo root.

| Script | Description |
|--------|-------------|
| `pnpm dev` | API + MySQL via Docker (watch mode) |
| `pnpm dev:dashboard` | Angular dev server on `:4200` (no auth) |
| `pnpm build` | Build all packages |
| `pnpm test` | Unit tests (all packages) |
| `pnpm test:e2e` | E2e tests via Docker (exits when done) |
| `pnpm lint` | Lint all packages |
| `pnpm deploy` | Deploy all CDK stacks to AWS |
| `pnpm deploy:frontend` | Build dashboard → sync to S3 → invalidate CloudFront |

## Local development

```bash
# API + MySQL with hot-reload (bind-mounted source)
pnpm dev
# → http://localhost:3000
# → http://localhost:3000/api-doc  (Swagger UI, set SWAGGER_ENABLED=true locally)

# Angular dashboard (proxies API calls to localhost:3000)
pnpm dev:dashboard
# → http://localhost:4200  (auth bypassed in dev)
```

## Tests

```bash
# Unit tests (no DB)
pnpm test

# E2e tests — spins up MySQL test container, runs suites, exits
pnpm test:e2e
```

## Deploy to AWS

### First-time setup

```bash
# Bootstrap CDK (once per account/region)
cd infra/cdk && npx cdk bootstrap aws://ACCOUNT_ID/eu-west-1
```

### Infrastructure

Deploys six stacks: Network → Database → Lambda → Frontend (S3 + CloudFront) → Cognito → API Gateway.

```bash
pnpm deploy
```

Outputs printed after deploy:

| Output | Stack |
|--------|-------|
| `ApiUrl` | `ProductServiceApiGatewayStack` |
| `UserPoolId` / `UserPoolClientId` | `ProductServiceCognitoStack` |
| `CloudFrontUrl` | `ProductServiceFrontendStack` |

### Frontend

After first `pnpm deploy`, fill in `apps/dashboard/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiBaseUrl: 'https://<ApiUrl>',
  cognito: {
    region: 'eu-west-1',
    userPoolId: '<UserPoolId>',
    userPoolClientId: '<UserPoolClientId>',
    domain: 'product-service-dashboard',
  },
};
```

Then build and deploy the frontend:

```bash
pnpm deploy:frontend
# Builds Angular, syncs to S3, invalidates CloudFront cache
```

Dashboard URL: printed as `CloudFrontUrl` in CDK outputs.  
Swagger UI: `<CloudFrontUrl>/api-doc`

### Tear down

```bash
pnpm --filter @product-service/cdk run destroy
```
