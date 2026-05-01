# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run start:dev        # dev server with watch mode
pnpm run build            # compile to dist/
pnpm run lint             # eslint --fix across src/ and test/
pnpm run format           # prettier --write across src/ and test/

pnpm run test             # unit tests (src/**/*.spec.ts)
pnpm run test:watch       # unit tests in watch mode
pnpm run test:e2e         # e2e tests (test/**/*.e2e-spec.ts)
pnpm run test:cov         # unit tests with coverage

# Run a single test file
pnpm run test -- --testPathPattern=products
```

## Architecture

This is a **NestJS 11** TypeScript backend microservice targeting an e-commerce products API backed by **MySQL via Sequelize**.

### Current state

The repo is at the NestJS scaffold stage — `AppModule` wires `AppController` + `AppService` with a single `GET /` hello route. The planned `Products` feature has not been built yet.

### Target structure (per TASK.md)

A `Products` module should be added under `src/products/` using a **Service → Repository → Model** layered architecture:

- **Module** (`products.module.ts`) — declares the feature; wires `{ provide: IProductsRepository, useClass: ProductsRepository }`
- **Controller** (`products.controller.ts`) — handles HTTP routes, uses `@Controller('products')`, delegates to the service
- **Service** (`products.service.ts`) — business logic only; depends on `IProductsRepository`, never imports Sequelize or `@InjectModel` directly
- **Repository** (`products.repository.ts`) — owns all Sequelize queries; injects `@InjectModel(Product)`; exposes domain-oriented methods (`findByToken`, etc.)
- **Repository interface** (`products.repository.interface.ts`) — abstract class used as the DI token so services depend on an abstraction
- **Model** (`product.model.ts`) — Sequelize model definition only, no logic

`AppModule` should import `SequelizeModule.forRoot(...)` (MySQL connection) and `ProductsModule`.

### Endpoints to implement

| Method | Path | Description |
|--------|------|-------------|
| POST | `/products` | Create — body: `name`, `productToken`, `price`, `stock` |
| GET | `/products` | List — paginated |
| GET | `/products/:id` | Get one by id or productToken |
| PATCH/PUT | `/products/:id` | Update stock |
| DELETE | `/products/:id` | Delete |

### Database schema

Table `products` in database `ecommerce`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | integer | PK, auto-increment |
| `productToken` | string | unique |
| `name` | string | |
| `price` | decimal | |
| `stock` | integer | |

### Key technical constraints

- Use `sequelize` package directly (not `sequelize-typescript`) unless you prefer the latter — both are acceptable
- Validate request bodies with `class-validator` + `class-transformer` (add as deps); return 400/404/409 with meaningful messages
- No implicit `any` is **not** enforced (`noImplicitAny: false`), but `strictNullChecks` is on
- `emitDecoratorMetadata` and `experimentalDecorators` are enabled — required for NestJS DI metadata
- Unit tests live alongside source (`src/**/*.spec.ts`); e2e tests live in `test/` and use a separate Jest config (`test/jest-e2e.json`)
