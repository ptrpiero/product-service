# Product Service Monorepo

pnpm workspace + Turborepo monorepo. NestJS e-commerce products API deployed on AWS ECS Fargate via CDK.

## Structure

```
apps/product-service/   NestJS 11 products API (MySQL / Sequelize)
infra/cdk/              AWS CDK TypeScript — VPC, RDS, ECS Fargate, API Gateway
packages/               shared libs (reserved)
```

## Prerequisites

- Node 24+, pnpm 10+
- Docker (for local dev / e2e)
- AWS CLI + credentials (for CDK deploy only)

## Install

```bash
pnpm install
```

## Local development

### Without Docker

```bash
# Start the NestJS dev server with watch mode (requires a local MySQL on port 3306)
pnpm --filter @product-service/app start:dev
```

### With Docker (app + MySQL, hot-reload)

```bash
# Spins up MySQL 8.4 and the NestJS app with watch mode.
# Source is bind-mounted from the host — saving a file triggers an instant reload.
# node_modules inside the container are protected by anonymous volumes so
# the host's node_modules never shadow the container's installed packages.
docker compose -f docker-compose.dev.yml up --build
```

App is available at <http://localhost:3000>. Swagger UI at <http://localhost:3000/swagger>.

## Tests

```bash
# Unit tests (no DB required)
pnpm --filter @product-service/app test

# Unit tests with coverage
pnpm --filter @product-service/app test:cov
```

### E2e tests

```bash
# Starts a dedicated MySQL test container, runs all e2e suites, then exits.
# Each suite resets the DB with sequelize.sync({ force: true }) + bulkCreate,
# so suites are fully isolated from each other.
# Exit code 0 = all tests passed.
docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit
```

## Deploy to AWS

The CDK app provisions VPC, RDS MySQL, ECS Fargate, and an API Gateway HTTP API.
The production Docker image is built and pushed to ECR automatically during `cdk deploy`.

```bash
# One-time bootstrap per AWS account/region (creates CDK S3 + ECR staging resources)
cd infra/cdk && npx cdk bootstrap aws://ACCOUNT_ID/REGION

# Deploy all four stacks (Network → Database → ECS → ApiGateway)
# Builds the Docker image from the monorepo root, pushes to ECR, then deploys.
# The public API URL is printed as ProductServiceApiUrl at the end.
pnpm --filter @product-service/cdk run deploy
```

To tear everything down:

```bash
pnpm --filter @product-service/cdk run destroy
```
