# SmartCoach 🏋️

> A full-stack AI-powered fitness tracking web application built for the MDS (Master in Data Science / Software Engineering) project.

[![CI/CD](https://github.com/YOUR_USERNAME/smartcoach/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/smartcoach/actions)

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [Team Members](#2-team-members)
3. [Main Features](#3-main-features)
4. [Tech Stack](#4-tech-stack)
5. [Architecture Overview](#5-architecture-overview)
6. [Local Run Instructions](#6-local-run-instructions)
7. [Docker Instructions](#7-docker-instructions)
8. [Frontend Description](#8-frontend-description)
9. [Backend Description](#9-backend-description)
10. [AI Agents](#10-ai-agents)
11. [User Stories & Backlog](#11-user-stories--backlog)
12. [Diagrams](#12-diagrams)
13. [Tests & Evals](#13-tests--evals)
14. [CI/CD](#14-cicd)
15. [Git Workflow](#15-git-workflow)
16. [Bug Reports](#16-bug-reports)
17. [AI Usage Report](#17-ai-usage-report)
18. [Demo Video](#18-demo-video)
19. [Known Limitations](#19-known-limitations)
20. [Future Improvements](#20-future-improvements)

---

## 1. Project Description

SmartCoach is a fitness tracking web application that allows users to:

- Track their daily weight and visualise progress on a chart
- Log workout sessions with detailed exercise data (sets, reps, weights, cardio duration)
- Receive **AI-generated nutrition recommendations** based on weekly weight progress
- Generate **AI-powered personalised workout plans** based on their goal and fitness level
- View a personalised dashboard with BMR, TDEE, calorie targets, and activity streaks

The app was originally built with Firebase. For the MDS local demo, Firebase has been replaced with a **local Node.js + Express + PostgreSQL backend** that runs entirely offline.

---

## 2. Team Members

| Name | Role | Contributions |
|---|---|---|
| [Dudulea Andrei] | Full Stack Developer | Backend, frontend API integration, AI agents |
| [Popescu Mihai Vlad] | Frontend Developer | UI components, routing, Recharts integration |
| [Zagan Claudiu Gabriel] | Data / DevOps | PostgreSQL schema, Docker, CI/CD, documentation |



---

## 3. Main Features

| Feature | Status |
|---|---|
| Demo login (no Firebase required) | ✅ Implemented |
| 3-step profile creation wizard | ✅ Implemented |
| Weight journal with Recharts chart | ✅ Implemented |
| Workout logging with exercises | ✅ Implemented |
| Workout Coach AI Agent (Agent 1) | ✅ Implemented |
| Nutrition / Progress AI Agent (Agent 2) | ✅ Implemented |
| AI agents work without API key (fallback) | ✅ Implemented |
| Agent request logging to `agent_logs` | ✅ Implemented |
| Calorie safety guardrail (≥1200 kcal) | ✅ Implemented |
| BMR / TDEE / Calorie target dashboard | ✅ Implemented |
| Streak badge | ✅ Implemented |
| PostgreSQL backend with schema + seed | ✅ Implemented |
| Backend input validation | ✅ Implemented |
| Automated tests (Vitest + Supertest) | ✅ Implemented |
| AI agent evals (10 cases × 2 agents) | ✅ Implemented |
| CI/CD pipeline (GitHub Actions) | ✅ Implemented |
| Docker Compose (postgres + backend + frontend) | ✅ Implemented |
| MDS documentation (diagrams, user stories, bug reports) | ✅ Implemented |

---

## 4. Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Recharts** (weight chart)
- **React Router v7** (routing)

### Backend
- **Node.js 20** + **TypeScript**
- **Express 4** (HTTP server)
- **PostgreSQL 16** (database)
- **pg** (PostgreSQL client)
- **bcryptjs** (password hashing)
- **uuid** (ID generation)

### AI Agents
- **Groq API** (`llama-3.3-70b-versatile`) — optional, for real LLM responses
- **Deterministic fallback** — always works without API key


### Testing
- **Vitest** (test runner)
- **Supertest** (HTTP integration tests)

### DevOps
- **GitHub Actions** (CI/CD)
- **Docker + Docker Compose** (containerisation)

---

## 5. Architecture Overview

```
SmartCoach
├── React Frontend (:5173)
│   ├── AuthContext → POST /api/auth/demo-login
│   ├── AppContext → REST API calls
│   └── Pages: Login, Profile, Dashboard, Weight, Workouts, AI Agents
│
├── Express Backend (:3001)
│   ├── Routes: auth, profile, workouts, progress, agents
│   ├── Controllers: validation + DB queries
│   └── Services: Workout Coach Agent, Nutrition Agent
│
└── PostgreSQL (:5432)
    ├── users, profiles
    ├── workouts, progress_entries
    └── agent_logs
```

See full diagrams in [`docs/diagrams/`](docs/diagrams/).

---

## 6. Local Run Instructions

### Prerequisites
- Node.js ≥ 20
- PostgreSQL ≥ 14

### Quick Start

```bash
# 1. Set up PostgreSQL
psql postgres -c "CREATE USER smartcoach WITH PASSWORD 'smartcoach';"
psql postgres -c "CREATE DATABASE smartcoach OWNER smartcoach;"
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/schema.sql
psql postgresql://smartcoach:smartcoach@localhost:5432/smartcoach -f backend/sql/seed.sql

# 2. Backend
cd backend
cp .env.example .env
npm install
npm run dev       # http://localhost:3001

# 3. Frontend (new terminal, from project root)
cp .env.example .env
npm install
npm run dev       # http://localhost:5173
```

**Demo credentials:** `demo@smartcoach.local` / `demo1234`

See [`docs/local-run.md`](docs/local-run.md) for detailed instructions.

---

## 7. Docker Instructions

```bash
docker compose up --build
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3001/api/health](http://localhost:3001/api/health)
- PostgreSQL auto-initialised with schema + seed data

Stop: `docker compose down`

---

## 8. Frontend Description

The frontend is a React + TypeScript SPA with a dark theme and Tailwind CSS.

### Pages
| Route | Component | Description |
|---|---|---|
| `/login` | `LoginPage` | Demo login + email/password form |
| `/profile` | `ProfilePage` | 3-step profile wizard / edit mode |
| `/dashboard` | `DashboardPage` | Stats overview + AI analysis preview |
| `/weight` | `WeightPage` | Weight journal + Recharts chart |
| `/workouts` | `WorkoutPage` | Workout logging + history |
| `/workout-coach` | `WorkoutCoachPage` | **Workout Coach AI Agent** (Agent 1) |
| `/agent` | `AgentPage` | **Nutrition AI Agent** (Agent 2) |

### Key Design Decisions
- **Firebase removed** — `src/firebase.ts` is preserved but commented out. Auth and data go through the local REST API.
- **Context pattern** — `AuthContext` handles session; `AppContext` handles all data operations.
- **API service layer** — `src/services/api.ts` provides typed `fetch()` wrappers for all endpoints.

---

## 9. Backend Description

The backend is a Node.js + Express + TypeScript API server.

### Structure
```
backend/src/
├── server.ts           — Express app
├── db.ts               — PostgreSQL pool
├── routes/             — Route definitions
├── controllers/        — Business logic + validation
├── services/           — AI agent services
│   ├── workout-agent.service.ts
│   └── nutrition-agent.service.ts
├── models/types.ts     — Shared TypeScript types
└── __tests__/          — Vitest + Supertest tests
backend/sql/
├── schema.sql          — Database schema
└── seed.sql            — Demo data
```

### Authentication (Demo)
`POST /api/auth/demo-login` with email + password. Returns `{ id, email, createdAt }`.
The frontend stores this in `localStorage`. No JWT — suitable for local demo only.

---

## 10. AI Agents

### Agent 1 — Workout Coach

**Endpoint:** `POST /api/agents/workout-coach`

**Input:**
```json
{
  "userId": "uuid",
  "equipment": "gym with full equipment",
  "constraints": "knee pain"
}
```

**Output:**
```json
{
  "warmup": ["step1", "step2", ...],
  "mainWorkout": [{ "name": "Squat", "sets": 4, "reps": 6, "notes": "..." }],
  "cooldown": ["step1", ...],
  "weeklyPlan": "Follow a 4-day split...",
  "tips": "Focus on progressive overload...",
  "generatedAt": "2026-06-08T..."
}
```

**Behaviour:**
- If `GROQ_API_KEY` is set → calls Groq API with structured JSON prompt
- Otherwise → deterministic templates per goal (weight_loss/weight_gain/maintenance)
- Volume reduced for sedentary users

---

### Agent 2 — Nutrition / Progress

**Endpoint:** `POST /api/agents/nutrition-progress`

**Output:**
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

**Guardrails:**
- Calories never go below **1200 kcal**
- Caloric adjustment capped at **±300 kcal/week**
- No dangerous dietary claims

Both agents log all requests/responses to the `agent_logs` table.

---

## 11. User Stories & Backlog

- [User Stories (20 stories across 5 epics)](docs/user-stories.md)
- [Project Backlog (Done / In Progress / To Do / Future)](docs/backlog.md)

---

## 12. Diagrams

| Diagram | Description |
|---|---|
| [Component Architecture](docs/diagrams/component-architecture.md) | Frontend and backend component graphs |
| [Backend Architecture & ERD](docs/diagrams/backend-architecture.md) | DB schema + REST API table |
| [AI Agent Workflow](docs/diagrams/ai-agent-workflow.md) | Sequence diagrams for both agents |
| [Use Case Diagram](docs/diagrams/use-case-diagram.md) | All user interactions |

All diagrams use **Mermaid** syntax and render on GitHub.

---

## 13. Tests & Evals

### Backend Tests

```bash
cd backend && npm test
```

| Test file | What it covers |
|---|---|
| `health.test.ts` | `GET /api/health` → 200 |
| `workout-agent.test.ts` | Agent 1 structure + safety |
| `nutrition-agent.test.ts` | Agent 2 structure + 1200 guardrail |
| `progress.validation.test.ts` | Weight input validation |
| `workout.validation.test.ts` | Exercise input validation |

### AI Agent Evals

- [Workout Agent Evals](evals/workout-agent-evals.json) — 10 cases
- [Nutrition Agent Evals](evals/nutrition-agent-evals.json) — 10 cases
- [Eval Strategy & Results](evals/sample-eval-results.md)
- [Testing Strategy](docs/testing-and-evals.md)

---

## 14. CI/CD

GitHub Actions pipeline at [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

**Jobs:**
1. **Frontend** — `npm ci` → lint → `npm run build`
2. **Backend** — `npm ci` → TypeScript build → `npm test`
3. **Summary** — reports combined pass/fail

Triggers on: `push` to `main`, `develop`, `feature/**`, `fix/**`; `pull_request` to `main`, `develop`.

---

## 15. Git Workflow

- [Full Git Workflow Documentation](docs/git-workflow.md)

**Branch strategy:** `main` → `develop` → `feature/*` / `fix/*`

**Commit convention:** `feat(scope): description` / `fix(scope): description`

**Recommended PRs to create:**
1. `fix/remove-firebase-local-demo` → resolves Bug #1
2. `fix/workout-duration-validation` → resolves Bug #2
3. `fix/agent-input-validation` → resolves Bug #3

---

## 16. Bug Reports

- [Bug Reports (3 resolved bugs)](docs/bug-reports.md)

| # | Bug | Resolution |
|---|---|---|
| 1 | `FirebaseError: auth/invalid-api-key` on startup | Firebase removed, replaced with local backend |
| 2 | Workout duration accepts 0 or negative values | Server-side validation added |
| 3 | AI agent accepts empty userId / missing profile | Input validation + 404 guard added |

---

## 17. AI Usage Report

- [Full AI Usage Report](docs/AI_USAGE_REPORT.md)

**Tools used:**
- **Antigravity (Claude)** — backend implementation, context rewrite, tests, documentation
- **ChatGPT** — planning, architecture decisions, presentation preparation
- **Groq API** — optional runtime LLM for agent responses

All AI-generated code was reviewed and validated by the team.

---

## 18. Demo Video

> 📽️ **TODO:** Record a demo video and upload to Google Drive / YouTube.
> Add the link here before submission.

In the meantime, see [`docs/demo.md`](docs/demo.md) for a step-by-step demo guide.

---

## 19. Known Limitations

- **Authentication** is demo-friendly only (localStorage, no JWT expiry)
- **No account registration** via UI — only the seeded demo user works
- **AI agents** use deterministic templates when no Groq API key is set
- **Frontend tests** not yet implemented
- **E2E tests** not yet implemented
- **Agent logs** are written to DB but not displayed in the UI

---

## 20. Future Improvements

- JWT-based authentication for production
- Account registration endpoint and UI
- Real LLM integration (Groq / OpenAI) always enabled (with rate limiting)
- Frontend component tests with Vitest + React Testing Library
- E2E tests with Playwright
- Progress photos feature
- Mobile-responsive PWA wrapper
- Wearable/health data integration (Apple Health, Google Fit)
- Advanced strength progress charts (PR tracking, volume trends)
- Meal tracking alongside weight entries