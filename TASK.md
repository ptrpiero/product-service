# Product Service — Backend Task

## Overview

Build a backend microservice for an e-commerce platform using **NestJS** and **Sequelize** (MySQL ORM). The service manages products in the database and exposes a RESTful API for full CRUD operations.

---

## 1. Database Setup

MySQL database: `ecommerce`, table: `products`

| Column | Type | Constraints |
|---|---|---|
| `id` | integer | auto-increment, primary key |
| `productToken` | string | unique |
| `name` | string | |
| `price` | decimal | |
| `stock` | integer | |

---

## 2. NestJS & Sequelize Implementation

Create a NestJS microservice named `products-service` with a `Products` module implementing the following endpoints:

### Endpoints

| Method | Description |
|---|---|
| **Create a Product** | `POST` — accepts `name`, `productToken`, `price`, `stock` in the request body |
| **Read Products** | `GET` — paginated list of all products |
| **Get Product** | `GET` — retrieve a single product by identifier |
| **Update Product** | `PATCH/PUT` — update the stock quantity of a specific product |
| **Delete Product** | `DELETE` — remove a product from the database |

---

## 3. Usage Examples

Provide sample requests and responses for each CRUD operation, covering both success and error cases.

---

## 4. Validation & Error Handling

- Validate all incoming requests using `class-validator`
- Return meaningful HTTP status codes and error messages for all failure scenarios (e.g., 400 Bad Request, 404 Not Found, 409 Conflict)

---

## 5. Sequelize Model

Define a Sequelize model for the `products` table, mapping all columns with appropriate types and constraints.

---

## Technical Notes

- Use the `sequelize` package (not `sequelize-typescript` unless preferred)
- Use NestJS decorators: `@Controller()`, `@Post()`, `@Get()`, `@Put()`, `@Delete()`, `@Body()`, `@Param()`, `@Query()`, etc.
- Wire Sequelize via NestJS dependency injection
- Follow NestJS and Sequelize best practices (modules, services, repositories pattern)

---

## Acceptance Criteria

- [ ] Full CRUD operations implemented and working correctly
- [ ] TypeScript used throughout (no implicit `any`)
- [ ] Request validation and meaningful error handling in place
- [ ] NestJS decorators and dependency injection used correctly
- [ ] NestJS + Sequelize best practices followed
- [ ] Unit and/or integration tests included
- [ ] API documented (README or equivalent)
