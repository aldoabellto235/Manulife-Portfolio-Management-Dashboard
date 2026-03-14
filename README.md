# Manulife Portfolio Management

A full-stack portfolio management dashboard for tracking investments and transactions.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Material UI v6 |
| State | Redux Toolkit + RTK Query |
| Backend | Node.js + Express + TypeScript |
| ORM | TypeORM |
| Database | PostgreSQL 16 |
| Auth | JWT + Basic Auth |

## Project Structure

```
manulife/
├── frontend/       # React + Vite SPA
├── backend/        # Express REST API
├── docker-compose.yml
├── .env            # Local environment (not committed)
└── .env.example    # Template for environment variables
```

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose

### Run with Docker

1. Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

2. Start all services:

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8800 |
| API Docs | http://localhost:8800/docs |

### Run Locally (Development)

**Backend:**

```bash
cd backend
cp .env .env.local   # or create your own
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: http://localhost:5173

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `BASIC_AUTH_USER` | Username for Basic Auth on public endpoints |
| `BASIC_AUTH_PASSWORD` | Password for Basic Auth on public endpoints |
| `VITE_API_BASE_URL` | API base URL used by the frontend build |

## Features

- **Authentication** — Register, login, JWT session persistence
- **Portfolio Dashboard** — Holdings overview with gain/loss summary
- **Investments** — Add, edit, delete holdings with paginated table
- **Transactions** — Record buy/sell events, paginated history, auto-syncs holdings
