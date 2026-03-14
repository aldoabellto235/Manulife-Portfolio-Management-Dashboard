# Portfolio Management Backend

REST API for managing investment portfolios. Built with Node.js, Express, TypeScript, and PostgreSQL following Clean Architecture and Domain-Driven Design principles.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Language | TypeScript 5 |
| Framework | Express 4 |
| ORM | TypeORM 0.3 |
| Database | PostgreSQL 16 |
| Auth | JWT + Basic Auth (Swagger docs) |
| Validation | Joi |
| DI Container | tsyringe |
| Logging | Winston |
| API Docs | Swagger UI (`/docs`) |

## Architecture

The project follows **Clean Architecture** with strict inward dependency rules:

```
src/
├── domain/               # Core business logic (no external deps)
│   ├── entities/         # Asset, Transaction, User
│   ├── value-objects/    # Money, Email, branded IDs
│   ├── repositories/     # Repository interfaces (ports)
│   ├── services/         # PerformanceCalculatorService
│   └── errors/           # Typed domain error objects
│
├── application/          # Use cases, DTOs, application ports
│   ├── use-cases/        # auth/, investment/, portfolio/, transaction/
│   ├── dtos/             # AssetDTO, TransactionDTO
│   └── ports/            # IUnitOfWork, IPasswordHasher, ITokenService
│
├── infrastructure/       # External concerns (DB, auth, config)
│   ├── persistence/
│   │   ├── typeorm/      # Models, migrations, data-source, UoW
│   │   ├── mappers/      # Domain ↔ ORM model mappers
│   │   └── repositories/ # TypeORM implementations
│   ├── auth/             # BcryptPasswordHasher, JwtTokenService
│   └── config/           # env validation, swagger spec
│
├── interfaces/           # HTTP layer (controllers, routes, middleware)
│   ├── http/
│   │   ├── controllers/  # AuthController, InvestmentController, etc.
│   │   ├── routes/       # Express routers
│   │   └── schemas/      # Joi validation schemas
│   └── middleware/       # auth, error-handler, rate-limit, request-id, logger
│
├── shared/               # Cross-cutting utilities
│   ├── result.ts         # Result<T, E> (Ok/Err)
│   ├── pagination.ts     # PaginatedResult<T>
│   ├── api-response.ts   # Standard response envelope helpers
│   └── logger.ts         # Winston logger
│
├── container.ts          # tsyringe DI registrations
└── server.ts             # Express app bootstrap
```

### Domain Concepts

**Investment (Asset)** — the current holding of a stock. Stores quantity and weighted average purchase price. Mutated by transactions.

**Transaction** — an immutable past event (BUY or SELL) that records what happened.

- **BUY** → creates or updates an Investment (recalculates weighted avg price), records a Transaction.
- **SELL** → reduces Investment quantity, records a Transaction. Fails if quantity is insufficient.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended for database)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and fill in the required values:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development` \| `production` \| `test` |
| `PORT` | No | `3000` | HTTP server port |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** | — | Min 32 chars, used to sign JWTs |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiry duration |
| `BASIC_AUTH_USER` | **Yes** | — | Username for Swagger UI basic auth |
| `BASIC_AUTH_PASSWORD` | **Yes** | — | Password for Swagger UI basic auth |

Example `.env`:

```env
NODE_ENV=development
PORT=8800
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_dev
JWT_SECRET=supersecretkeythatisatleast32chars!!
JWT_EXPIRES_IN=7d
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=secret
```

### 3. Start the database

```bash
docker compose up db -d
```

### 4. Run in development

```bash
npm run dev
```

The server starts on the configured port (default `8800`) with hot reload.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled output |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:revert` | Revert last migration |
| `npm run db:migration:generate` | Generate migration from entity changes |

## API Endpoints

All routes are prefixed with `/api/v1`.

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | None | Register a new user |
| `POST` | `/login` | None | Login and receive JWT |
| `GET` | `/me` | JWT | Get current user profile |

### Investments — `/api/v1/investments`

Manages individual investment holdings.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | List investments (paginated) |
| `POST` | `/` | JWT | Add a new investment |
| `GET` | `/:id` | JWT | Get a single investment |
| `PATCH` | `/:id` | JWT | Update an investment |
| `DELETE` | `/:id` | JWT | Delete an investment |

### Portfolio — `/api/v1/portfolio`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | Get portfolio summary + paginated holdings |

### Transactions — `/api/v1/transactions`

Records BUY/SELL events and automatically syncs the corresponding investment.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | JWT | List transaction history (paginated) |
| `POST` | `/` | JWT | Add a BUY or SELL transaction |
| `DELETE` | `/:id` | JWT | Delete a transaction |

### Pagination

Endpoints that return lists accept query parameters:

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number (1-indexed) |
| `limit` | `10` | Items per page |

Response envelope:

```json
{
  "status": "success",
  "code": 200,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  },
  "data": [...]
}
```

### Other Endpoints

| Path | Auth | Description |
|---|---|---|
| `GET /health` | None | Health check |
| `GET /docs` | Basic Auth | Swagger UI |
| `GET /docs.json` | None | OpenAPI spec (JSON) |

## Running with Docker

Build and run the full stack (API + PostgreSQL):

```bash
docker compose up --build
```

The API will be available at `http://localhost:8800` once the database is healthy.

To run only the database locally and the API with `npm run dev`:

```bash
docker compose up db -d
npm run dev
```

## Security

- **Helmet** — sets secure HTTP headers
- **CORS** — enabled globally
- **Rate limiting** — auth endpoints: 10 req/15 min; global: 100 req/min
- **JWT** — required for all protected routes (`Authorization: Bearer <token>`)
- **Basic Auth** — protects the Swagger UI (`/docs`)
- **Non-root Docker user** — container runs as `appuser`
- **Optimistic locking** — `@VersionColumn` on Asset prevents concurrent BUY/SELL race conditions
- **Atomic transactions** — BUY/SELL wraps asset update + transaction save in a single DB transaction via `IUnitOfWork`
