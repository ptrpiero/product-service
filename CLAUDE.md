# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run start:dev        # dev server with watch mode
pnpm run build            # compile to dist/
pnpm run lint             # eslint --fix across src/ and test/
pnpm run format           # prettier --write across src/ and test/

pnpm run test             # unit tests
pnpm run test:watch       # unit tests in watch mode
pnpm run test:e2e         # e2e tests — requires a live MySQL (see Docker section)
pnpm run test:cov         # unit tests with coverage

# Run a single test file
pnpm run test -- --testPathPattern=products
```

## Docker environments

Three dedicated Compose files — never mix them:

| File | Purpose | Command |
|------|---------|---------|
| `docker-compose.yml` | Production build | `docker compose up --build` |
| `docker-compose.dev.yml` | Dev with watch mode + bind mount | `docker compose -f docker-compose.dev.yml up --build` |
| `docker-compose.e2e.yml` | E2e test runner (exits when done) | `docker compose -f docker-compose.e2e.yml up --build --abort-on-container-exit` |

Each compose file has its own Dockerfile (`Dockerfile`, `Dockerfile.dev`, `Dockerfile.e2e`) and a matching `<Dockerfile>.dockerignore` used by BuildKit.

The dev compose bind-mounts the host source tree into the container. `node_modules` is protected by an anonymous volume so the container's installed packages are never overridden by the host.

## Architecture

**NestJS 11** TypeScript backend — e-commerce products API backed by MySQL via Sequelize.

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
- `DatabaseSeederService` (`src/database/database.module.ts`) — implements `OnApplicationBootstrap`; seeds 5 products if the table is empty
- Env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (loaded via `@nestjs/config`)

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

### Swagger

Available at `/swagger` when `NODE_ENV !== 'production'`. Set up in `src/main.ts` using `DocumentBuilder` + `SwaggerModule`. Full coverage: `@ApiProperty` on all DTOs and the `Product` model; `@ApiOperation`/`@ApiResponse`/`@ApiParam` on every controller method.

### Testing

- **Unit tests** — `src/products/__tests__/`; mock `IProductsRepository` in service tests, mock `ProductsService` in controller tests; no DB needed
- **E2e tests** — `test/`; use `AppModule` against a real MySQL (`ecommerce_test` database); `beforeAll` boots the app once, `beforeEach` calls `sequelize.sync({ force: true })` + `bulkCreate` for a clean slate; `maxWorkers: 1` prevents parallel suite conflicts on the shared DB
- E2e config: `jest.e2e.config.json` (root-level, required by Jest 30)

### Key constraints

- `strictNullChecks: true`, `noImplicitAny: true`, `emitDecoratorMetadata: true`
- Sequelize model columns must use `declare` (not `!`) to avoid overwriting Sequelize property descriptors
- `productToken` has a `@Unique` index — enforced at DB level
- `synchronize: true` is dev-only safe; disable in production and use migrations instead
