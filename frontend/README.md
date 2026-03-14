# Portfolio Management — Frontend

React + TypeScript SPA for the Portfolio Management Dashboard.

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| UI | Material UI v6 |
| State | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| Forms | React Hook Form + Joi |
| Notifications | notistack |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Update `.env` with your values:

```env
VITE_API_BASE_URL=http://localhost:8800/api/v1
VITE_BASIC_AUTH_USER=your-user
VITE_BASIC_AUTH_PASSWORD=your-password
```

### Run dev server

```bash
npm run dev
```

App runs at http://localhost:5173

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm run type-check` | TypeScript type check without emitting |

## Project Structure

```
src/
├── app/                  # Store, router, root hooks
├── features/
│   ├── auth/             # Login, register, JWT session
│   ├── portfolio/        # Dashboard, holdings, add/edit investment
│   └── transactions/     # Transaction history, record buy/sell
├── layout/               # AppLayout (navbar + page shell)
└── shared/
    ├── api/              # Base query with 401 auto-redirect
    ├── theme/            # MUI theme + design tokens
    └── utils/            # formatCurrency, formatDate
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:8800/api/v1`) |
| `VITE_BASIC_AUTH_USER` | Basic Auth username for public endpoints |
| `VITE_BASIC_AUTH_PASSWORD` | Basic Auth password for public endpoints |

## Docker

Built as a multi-stage image: Node 20 builds the Vite app, nginx:alpine serves the static files.

```bash
# From the repo root
docker compose up --build -d frontend
```

Runs on port `3000` by default (configurable via `FRONTEND_PORT`).
