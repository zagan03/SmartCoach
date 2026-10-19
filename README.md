# SmartCoach 🏋️

> A full-stack AI-powered fitness & nutrition tracking web application built with React, TypeScript, Node.js, PostgreSQL, and Groq LLM Agents.

🎥 **Video Demo:** [Watch on YouTube](https://www.youtube.com/watch?v=hqxt8aT4Jgg)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Main Features](#2-main-features)
3. [Tech Stack](#3-tech-stack)
4. [System Architecture](#4-system-architecture)
5. [Quick Start (Docker)](#5-quick-start-docker)
6. [Local Setup Instructions](#6-local-setup-instructions)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Backend & Database Architecture](#8-backend--database-architecture)
9. [AI Agents & Safety Guardrails](#9-ai-agents--safety-guardrails)
10. [Testing & LLM Evaluations](#10-testing--llm-evaluations)
11. [CI/CD & Engineering Workflow](#11-cicd--engineering-workflow)
12. [Documentation & System Diagrams](#12-documentation--system-diagrams)
13. [Team & Contributions](#13-team--contributions)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Project Overview

**SmartCoach** is an end-to-end fitness and nutrition platform designed to help users track workouts, monitor body-weight trends, and receive dynamic, AI-assisted coaching adjustments.

Key capabilities include:
- **Daily Weight & Biometrics Tracking** with interactive trend visualisation
- **Structured Workout Logging** (sets, reps, load volume, and cardio duration)
- **AI Nutrition & Progress Agent** that analyses rolling 7-day weight averages to dynamically adjust caloric and macronutrient targets
- **AI Workout Coach Agent** that generates personalised training splits tailored to available equipment and physical constraints
- **Real-time Analytics Dashboard** computing BMR, TDEE, caloric targets, and activity streaks

---

## 2. Main Features

| Feature | Status |
|---|---|
| 3-step user onboarding & biometric profile wizard | ✅ Implemented |
| Weight journal with interactive Recharts trendlines | ✅ Implemented |
| Workout session logging with exercise breakdown | ✅ Implemented |
| Workout Coach AI Agent (Groq LLM + deterministic fallback) | ✅ Implemented |
| Nutrition & Progress AI Agent with rolling 7-day analysis | ✅ Implemented |
| Calorie safety guardrails (≥1200 kcal floor & ±300 kcal/week cap) | ✅ Implemented |
| Audit logging of all AI prompts & responses (`agent_logs`) | ✅ Implemented |
| BMR / TDEE / Macronutrient target dashboard & streak tracker | ✅ Implemented |
| Relational PostgreSQL schema with automated seed data | ✅ Implemented |
| Server-side payload validation & error handling | ✅ Implemented |
| Automated integration test suite (Vitest + Supertest) | ✅ Implemented |
| Automated LLM Agent Evaluation suite (20 test cases) | ✅ Implemented |
| Multi-container Docker Compose orchestration | ✅ Implemented |
| Automated CI/CD pipeline (GitHub Actions) | ✅ Implemented |

---

## 3. Tech Stack

### Backend & Data
- **Node.js 20** + **TypeScript**
- **Express 4** (REST API architecture)
- **PostgreSQL 16** (`pg` connection pooling, relational schema design)
- **bcryptjs** & **uuid**

### AI & LLM Engineering
- **Groq API** (`llama-3.3-70b-versatile`) for structured JSON generation
- **Deterministic Fallback Engine** ensuring 100% availability without external API keys
- **Custom LLM Evaluation Pipeline** validating schema compliance and safety guardrails

### Frontend
- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS** (responsive dark-theme UI)
- **Recharts** (data visualisation)
- **React Router v7**

### DevOps & Quality Assurance
- **Docker & Docker Compose** (multi-service containerisation)
- **GitHub Actions** (continuous integration for build, linting, and testing)
- **Vitest** & **Supertest** (unit and HTTP integration testing)

---

## 4. System Architecture

```text
SmartCoach
├── React Frontend (:5173)
│   ├── AuthContext → Session & authentication state
│   ├── AppContext  → Centralised state & REST API integration
│   └── Pages       → Dashboard, Weight, Workouts, AI Coach, Nutrition Agent
│
├── Express Backend (:3001)
│   ├── Routes      → /api/auth, /api/profile, /api/workouts, /api/progress, /api/agents
│   ├── Controllers → Request validation, business logic & SQL queries
│   └── Services    → Workout Coach Agent & Nutrition Progress Agent
│
└── PostgreSQL (:5432)
    ├── users, profiles
    ├── workouts, progress_entries
    └── agent_logs
```

Detailed Mermaid architecture diagrams are available in [`docs/diagrams/`](docs/diagrams/).

---

## 5. Quick Start (Docker)

Run the entire stack (PostgreSQL + Express Backend + React Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend Healthcheck:** [http://localhost:3001/api/health](http://localhost:3001/api/health)
- **Database:** PostgreSQL 16 (automatically initialised with `schema.sql` and `seed.sql`)

To stop all containers:

```bash
docker compose down
```

---

## 6. Local Setup Instructions

### Prerequisites
- Node.js ≥ 20
- PostgreSQL ≥ 14

### Step-by-Step Setup

```bash
# 1. Initialise PostgreSQL database & seed data
psql postgres -c "CREATE USER smartcoach WITH PASSWORD 'smartcoach';"
psql postgres -c "CREATE DATABASE smartcoach OWNER smartcoach;"
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/schema.sql
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/seed.sql

# 2. Start the Backend API
cd backend
cp .env.example .env
npm install
npm run dev        # Runs on http://localhost:3001

# 3. Start the Frontend SPA (new terminal, from project root)
cp .env.example .env
npm install
npm run dev        # Runs on http://localhost:5173
```

**Demo Credentials:** `demo@smartcoach.local` / `demo1234`  
See [`docs/local-run.md`](docs/local-run.md) for full configuration details.

---

## 7. Frontend Architecture

| Route | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Authentication & instant demo login |
| `/profile` | `ProfilePage` | 3-step biometric onboarding & profile editor |
| `/dashboard` | `DashboardPage` | BMR/TDEE overview, streak counter & AI insights |
| `/weight` | `WeightPage` | Daily weight logs & Recharts progression graph |
| `/workouts` | `WorkoutPage` | Exercise logger & workout history |
| `/workout-coach` | `WorkoutCoachPage` | Interactive Workout Coach AI Agent |
| `/agent` | `AgentPage` | Interactive Nutrition & Caloric Adjustment Agent |

- **Typed API Layer:** `src/services/api.ts` encapsulates all HTTP requests with strict TypeScript interfaces.

---

## 8. Backend & Database Architecture

```text
backend/
├── src/
│   ├── server.ts                 — Express app & middleware configuration
│   ├── db.ts                     — PostgreSQL connection pool
│   ├── routes/                   — REST endpoint definitions
│   ├── controllers/              — Input validation & SQL execution
│   ├── services/                 — LLM Agent orchestration & fallback logic
│   │   ├── workout-agent.service.ts
│   │   └── nutrition-agent.service.ts
│   ├── models/types.ts           — Shared TypeScript domain models
│   └── __tests__/                — Vitest + Supertest integration suites
└── sql/
    ├── schema.sql                — Relational DDL schema & constraints
    └── seed.sql                  — Initial demo dataset
```

---

## 9. AI Agents & Safety Guardrails

### Agent 1 — Workout Coach (`POST /api/agents/workout-coach`)

**Input Payload:**
```json
{
  "userId": "uuid",
  "equipment": "gym with full equipment",
  "constraints": "knee pain"
}
```

**Output Payload:**
```json
{
  "warmup": ["step1", "step2"],
  "mainWorkout": [{ "name": "Squat", "sets": 4, "reps": 6, "notes": "..." }],
  "cooldown": ["step1"],
  "weeklyPlan": "Follow a 4-day split...",
  "tips": "Focus on progressive overload...",
  "generatedAt": "2026-06-08T..."
}
```

- Uses **Groq (`llama-3.3-70b-versatile`)** with structured JSON schema enforcement when `GROQ_API_KEY` is provided, falling back seamlessly to a deterministic rule engine when offline.

---

### Agent 2 — Nutrition & Progress (`POST /api/agents/nutrition-progress`)

**Output Payload:**
```json
{
  "calories": 1800,
  "protein": 153,
  "hydration": "2.8L",
  "progressFeedback": "Great progress this week...",
  "mealPlanSummary": "Breakfast: oats with yoghurt...",
  "adjustment": -150,
  "avgWeightLast7": 84.1,
  "avgWeightPrev7": 84.9,
  "currentKcal": 1950,
  "generatedAt": "2026-06-08T..."
}
```

- **Safety Guardrails:** Enforces a strict minimum threshold of **1200 kcal/day** and caps weekly adjustments at **±300 kcal** to prevent unsafe recommendations.
- **Observability:** All agent requests and responses are persisted in the `agent_logs` table.

---

## 10. Testing & LLM Evaluations

### Automated Backend Tests
```bash
cd backend && npm test
```

| Test Suite | Coverage |
|---|---|
| `health.test.ts` | Healthcheck endpoint verification (`GET /api/health`) |
| `workout-agent.test.ts` | Workout Coach payload structure & constraint handling |
| `nutrition-agent.test.ts` | Nutrition Agent calculations & 1200 kcal safety guardrail |
| `progress.validation.test.ts` | Boundary validation for weight & biometric entries |
| `workout.validation.test.ts` | Payload validation for workout & exercise logs |

### AI Agent Evaluations (`evals/`)
- [Workout Agent Evals](evals/workout-agent-evals.json) — 10 test scenarios
- [Nutrition Agent Evals](evals/nutrition-agent-evals.json) — 10 test scenarios
- [Evaluation Results & Metrics](evals/sample-eval-results.md)
- [Testing & Evaluation Documentation](docs/testing-and-evals.md)

---

## 11. CI/CD & Engineering Workflow

- **GitHub Actions Pipeline ([`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)):** Automatically runs frontend builds/linting and backend TypeScript compilation + Vitest test suites on every push and pull request across `main`, `develop`, `feature/**`, and `fix/**`.
- **Git Workflow:** Feature-branch workflow with Pull Request reviews and conventional commits (`feat:`, `fix:`, `docs:`). See [`docs/git-workflow.md`](docs/git-workflow.md) and [`docs/bug-reports.md`](docs/bug-reports.md).

---

## 12. Documentation & System Diagrams

| Document | Description |
|---|---|
| [Component Architecture](docs/diagrams/component-architecture.md) | Frontend & backend module dependency graphs |
| [Backend Architecture & ERD](docs/diagrams/backend-architecture.md) | PostgreSQL Entity-Relationship Diagram & REST API specification |
| [AI Agent Workflow](docs/diagrams/ai-agent-workflow.md) | Sequence diagrams for LLM prompt & fallback pipelines |
| [Use Case Diagram](docs/diagrams/use-case-diagram.md) | End-to-end user interaction flows |
| [User Stories & Backlog](docs/user-stories.md) | 20 user stories across 5 product epics |

---

## 13. Team & Contributions

Developed collaboratively using an Agile workflow, Pull Requests, and peer Code Reviews:

| Team Member | Focus Areas |
|---|---|
| **Zagan Claudiu-Gabriel** | Backend API, PostgreSQL Schema & Queries, AI Agent Services & Evals, Docker, CI/CD |
| **Dudulea Andrei** | Full-Stack Architecture, REST API Integration, AI Agent Services, State Management |
| **Popescu Mihai Vlad** | Frontend Architecture, UI Components, Routing, Data Visualisation (Recharts) |

---

## 14. Future Roadmap

- JWT authentication with refresh tokens and full user registration flow
- Rate limiting and caching layer for LLM API calls
- End-to-end (E2E) browser testing with Playwright
- Wearable health data sync (Apple Health / Google Fit)
- Progressive Web App (PWA) offline support
