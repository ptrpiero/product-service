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
pnpm run test:e2e         # e2e tests (test/**/*.e2e-spec.ts)
pnpm run test:cov         # unit tests with coverage

# Run a single test file
pnpm run test -- --testPathPattern=products
```

## Architecture

**NestJS 11** TypeScript backend — e-commerce products API, MySQL via Sequelize (not yet wired; currently in-memory).

### Layered structure: Service → Repository → Model

The `Products` feature lives under `src/products/` and follows a strict layered pattern:

- **Controller** — HTTP only; delegates everything to `ProductsService`
- **Service** — business logic; depends on `IProductsRepository` (abstract class used as DI token), never touches Sequelize directly
- **Repository** — owns all data access; implements `IProductsRepository`
- **Model** — plain data shape (`Product` class), no logic

DI binding in `ProductsModule`: `{ provide: IProductsRepository, useClass: ProductsRepository }`

### Current state

- `GET /products` — paginated list (`?page=&limit=`)
- `GET /products/:uuid` — find by `productToken`; 404 if not found
- Repository is **in-memory** (seeded array); Sequelize/MySQL not yet connected
- No DTOs or `ValidationPipe` yet
- Unit tests live in `src/products/__tests__/`

### Remaining endpoints

| Method | Path | Notes |
|--------|------|-------|
| POST | `/products` | Create; body: `name`, `productToken`, `price`, `stock` |
| PATCH/PUT | `/products/:id` | Update stock |
| DELETE | `/products/:id` | Delete |

### Database schema (target)

Table `products` in database `ecommerce`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | integer | PK, auto-increment |
| `productToken` | string | unique identifier |
| `name` | string | |
| `price` | decimal | |
| `stock` | integer | |

### Key constraints

- Validate request bodies with `class-validator` + `class-transformer`; return 400/404/409 with meaningful messages
- `noImplicitAny: false`, `strictNullChecks: true`
- `emitDecoratorMetadata` + `experimentalDecorators` enabled (required for NestJS DI)
- e2e tests use a separate Jest config: `test/jest-e2e.json`
