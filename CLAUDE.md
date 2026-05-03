# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo structure

```
/                              ← monorepo root (pnpm workspace + Turborepo)
├── apps/
│   └── product-service/       ← NestJS 11 e-commerce API (Fastify platform)
├── infra/
│   └── cdk/                   ← AWS CDK TypeScript app (VPC, RDS, Lambda, Cognito, API GW)
├── packages/                  ← shared libs (empty, reserved for future use)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json               ← workspace root
```

## Commands

Run from the **monorepo root** unless stated otherwise.

### Turborepo pipelines (all packages)

```bash
pnpm build            # build all packages
pnpm test             # unit tests across all packages
pnpm lint             # lint all packages
pnpm format           # format all packages
```

### Scoped to product-service

```bash
pnpm --filter @product-service/app start:dev   # dev server with watch mode
pnpm --filter @product-service/app build        # compile to apps/product-service/dist/
pnpm --filter @product-service/app lint         # eslint --fix
pnpm --filter @product-service/app test         # unit tests
pnpm --filter @product-service/app test:e2e     # e2e — requires a live MySQL (see Docker section)
pnpm --filter @product-service/app test:cov     # unit tests with coverage

# Run a single test file (from apps/product-service/)
cd apps/product-service && pnpm test -- --testPathPattern=products
```

### CDK infrastructure

```bash
# Prerequisites: AWS credentials configured; first deploy needs bootstrap:
#   cd infra/cdk && npx cdk bootstrap aws://ACCOUNT_ID/REGION

pnpm --filter @product-service/cdk run synth    # synthesise CloudFormation (no credentials needed)
pnpm --filter @product-service/cdk run diff     # diff against deployed stacks
pnpm --filter @product-service/cdk run deploy   # cdk deploy --all
pnpm --filter @product-service/cdk run destroy  # cdk destroy --all
```

## Docker environments

Three dedicated Compose files at the **monorepo root** — never mix them.
Build context for all three is the monorepo root; Dockerfiles live under `apps/product-service/`.

| File | Purpose | Command |
|------|---------|---------|
| `docker-compose.yml` | Production build | `docker compose up --build` |
| `docker-compose.dev.yml` | Dev with watch mode + bind mount | `docker compose -f docker-compose.dev.yml up --build` |
| `docker-compose.e2e.yml` | E2e test runner (exits when done) | `docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit` |

Docker uses `main.ts` → `createApp()` → `app.listen()`. Lambda uses `lambda.ts` → `createApp()` → Fastify `inject()`. Both share `bootstrap.ts`.

## Architecture

**NestJS 11** TypeScript backend — e-commerce products API backed by MySQL via Sequelize.  
**HTTP platform**: Fastify (`@nestjs/platform-fastify`). Express is NOT used.

### Entrypoints

| File | Used by | Notes |
|------|---------|-------|
| `src/bootstrap.ts` | both | shared NestJS setup: pipes, interceptors, Swagger (non-prod only) |
| `src/main.ts` | Docker / local dev | `FastifyAdapter({ logger: true })` + `app.listen(port, '0.0.0.0')` |
| `src/lambda.ts` | AWS Lambda | `FastifyAdapter()` + Fastify native `inject()` — no external adapter lib |

`lambda.ts` caches the Fastify instance across warm invocations. Handles API Gateway HTTP API v2 payload format (`APIGatewayProxyEventV2`).

### Layered structure

```
Controller → Service → IProductsRepository (abstract class / DI token)
                              ↓
                       ProductsRepository   ←  ProductEntity (Sequelize model)
                                                product.model.ts (plain domain type)
```

- **Controller** (`products.controller.ts`) — HTTP only; `ParseIntPipe` on all `:id` params
- **Service** (`products.service.ts`) — business logic and error throwing; never touches Sequelize
- **IProductsRepository** (`products.repository.interface.ts`) — abstract class used as DI token; methods operate on the plain `Product` domain type
- **ProductsRepository** (`products.repository.ts`) — Sequelize implementation; maps `ProductEntity` → `Product` via `toPlain()` (required because `mysql2` returns `DECIMAL` as a string)
- **ProductEntity** (`product.entity.ts`) — Sequelize model (`extends Model`), uses `declare` not `!` on column properties
- **Product** (`product.model.ts`) — plain domain class; used for all interface/service types; has `@ApiProperty` decorators for Swagger

DI binding in `ProductsModule`: `{ provide: IProductsRepository, useClass: ProductsRepository }`

### Database

- MySQL 8.4, database `ecommerce`, table `products`
- `synchronize: true` in `SequelizeModule` → `CREATE TABLE IF NOT EXISTS` on startup
- `DatabaseSeederService` (`apps/product-service/src/database/database.module.ts`) — implements `OnApplicationBootstrap`; seeds 5 products if the table is empty
- Env vars (local/Docker): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Env vars (Lambda): `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_SECRET_ARN` — credentials fetched from Secrets Manager at cold start via `@aws-sdk/client-secrets-manager`
- Connection pool: `{ min: 0, max: 2 }` — Lambda safeguard (no RDS Proxy)

### API

All routes are under `/products`. Identifiers use numeric `id` (PK), not `productToken`.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/products` | Paginated (`?page=&limit=`); ordered by `id ASC` |
| GET | `/products/:id` | 404 if not found |
| POST | `/products` | Body: `name`, `productToken`, `price`, `stock`; 409 on duplicate token |
| PATCH | `/products/:id` | Updates `stock` only |
| PUT | `/products/:id` | Replaces `name`, `price`, `stock` |
| DELETE | `/products/:id` | 404 if not found |

All routes protected by Cognito JWT authorizer at API Gateway level — no auth logic in NestJS.

### Swagger

Available at `/swagger` when `NODE_ENV !== 'production'`. Set up in `bootstrap.ts`. Full coverage: `@ApiProperty` on all DTOs and the `Product` model; `@ApiOperation`/`@ApiResponse`/`@ApiParam` on every controller method.

### Testing

- **Unit tests** — `apps/product-service/src/products/__tests__/`; mock `IProductsRepository` in service tests, mock `ProductsService` in controller tests; no DB needed
- **E2e tests** — `apps/product-service/test/`; use `AppModule` against a real MySQL (`ecommerce_test` database); `beforeAll` boots the app once, `beforeEach` calls `sequelize.sync({ force: true })` + `bulkCreate` for a clean slate; `maxWorkers: 1` prevents parallel suite conflicts on the shared DB
- E2e config: `apps/product-service/jest.e2e.config.json`

### Key constraints

- `strictNullChecks: true`, `noImplicitAny: true`, `emitDecoratorMetadata: true`
- Sequelize model columns must use `declare` (not `!`) to avoid overwriting Sequelize property descriptors
- `productToken` has a `@Unique` index — enforced at DB level
- `synchronize: true` is dev-only safe; disable in production and use migrations instead
- `mysql2` is loaded dynamically by Sequelize (`require(dialectVar)` — not a string literal). esbuild cannot bundle it statically. Solution: mark as `external` and run `npm install mysql2` into the output directory from `build-lambda.mjs`

## CDK infrastructure

Five stacks deployed in order:

| Stack | Resources |
|-------|-----------|
| `ProductServiceNetworkStack` | VPC (2 AZs, 1 NAT), public/private/isolated subnets, 2 security groups (Lambda + DB) |
| `ProductServiceDatabaseStack` | RDS MySQL 8.0 t3.micro, Secrets Manager credentials at `/product-service/db/credentials` |
| `ProductServiceLambdaStack` | Lambda function (Node 22, 512 MB, 30s), esbuild bundle, VPC private subnet |
| `ProductServiceCognitoStack` | User Pool (email sign-in, admin-only), User Pool Client |
| `ProductServiceApiGatewayStack` | HTTP API v2, `HttpLambdaIntegration`, Cognito JWT `defaultAuthorizer` |

- **Lambda bundle**: `infra/cdk/scripts/build-lambda.mjs` — esbuild + `@anatine/esbuild-decorators` plugin; single minified file ~4–5 MB; mysql2 installed separately via `npm install`
- **Asset hashing**: `AssetHashType.OUTPUT` — CDK hashes bundler output, not source. Prevents reuse of stale S3 assets when bundling strategy changes
- **DB credentials**: Lambda fetches at cold start from Secrets Manager using `DB_SECRET_ARN` env var
- **API URL**: printed as `ProductServiceApiGatewayStack.ApiUrl` CloudFormation output after deploy
- **Deployed region**: `eu-west-1`
