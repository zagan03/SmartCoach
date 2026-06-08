# Local Run Instructions

## Prerequisites

- **Node.js** ≥ 20 — [nodejs.org](https://nodejs.org)
- **PostgreSQL** ≥ 14 — [postgresql.org](https://postgresql.org)
- **npm** ≥ 10 (comes with Node.js)

---

## Option A — Run without Docker (recommended for development)

### Step 1 — Set up PostgreSQL

```bash
# Create database and user
psql postgres -c "CREATE USER smartcoach WITH PASSWORD 'smartcoach';"
psql postgres -c "CREATE DATABASE smartcoach OWNER smartcoach;"

# Run schema + seed
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/schema.sql
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/seed.sql
```

### Step 2 — Set up backend environment

```bash
cd backend
cp .env.example .env
# Edit backend/.env if your PostgreSQL settings differ
```

### Step 3 — Start the backend

```bash
cd backend
npm install
npm run dev
# Backend running at http://localhost:3001
# Test: curl http://localhost:3001/api/health
```

### Step 4 — Set up frontend environment

```bash
# From project root
cp .env.example .env
# .env should contain: VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 5 — Start the frontend

```bash
# From project root
npm install
npm run dev
# Frontend running at http://localhost:5173
```

### Step 6 — Open the app

1. Open [http://localhost:5173](http://localhost:5173)
2. Click **"⚡ Intră cu contul demo"** (demo login button)
3. Or log in with: `demo@smartcoach.local` / `demo1234`

---

## Option B — Run with Docker Compose

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# From project root
docker compose up --build
```

This starts:
- PostgreSQL on port 5432 (with schema + seed auto-applied)
- Backend on port 3001
- Frontend on port 5173 (served via nginx)

Wait ~30 seconds for all services to be healthy, then open:
[http://localhost:5173](http://localhost:5173)

### Stop services

```bash
docker compose down
# To also remove the database volume:
docker compose down -v
```

---

## Running Tests

```bash
cd backend
npm install
npm test
```

---

## Running Evals

```bash
cd backend
npm test   # Covers agent service-level evals
```

---

## Environment Variables Reference

### Frontend (`.env`)
| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Backend API URL |

### Backend (`backend/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Backend port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `smartcoach` | Database name |
| `DB_USER` | `smartcoach` | Database user |
| `DB_PASSWORD` | `smartcoach` | Database password |
| `DATABASE_URL` | *(optional)* | Full connection string (overrides individual settings) |
| `GROQ_API_KEY` | *(optional)* | Groq API key — if not set, agents use deterministic templates |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin |

---

## Demo Account

| Field | Value |
|---|---|
| Email | `demo@smartcoach.local` |
| Password | `demo1234` |

The demo account has:
- A profile (Male, 28y, 85kg → 78kg, moderate activity, weight loss goal)
- 7 weight entries (last 13 days, showing downward trend)
- 3 workout sessions (chest, back, legs)
