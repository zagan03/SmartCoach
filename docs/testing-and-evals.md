# Testing and Evals Strategy

## Overview

SmartCoach uses a layered testing strategy appropriate for an MDS project:

1. **Backend unit tests** — Vitest + Supertest for API validation
2. **AI agent evals** — structured input/output cases in JSON
3. **Frontend** — manual testing (automated frontend tests are marked as TODO)

---

## Backend Tests

### Location: `backend/src/__tests__/`

| File | What it tests | Type |
|---|---|---|
| `health.test.ts` | `GET /api/health` returns 200 with correct shape | Integration |
| `workout-agent.test.ts` | Agent 1 service — structure, relevance, guardrails | Unit |
| `nutrition-agent.test.ts` | Agent 2 service — calories, guardrail, hydration, edge cases | Unit |
| `progress.validation.test.ts` | Weight input validation (all invalid scenarios) | Integration |
| `workout.validation.test.ts` | Workout input validation (sets, reps, duration) | Integration |

### Running Tests

```bash
cd backend
npm install
npm test
```

### Key Assertions

- ✅ `GET /api/health` → `{ status: 'ok' }`
- ✅ `POST /api/progress { weight: 10 }` → `400` (below minimum)
- ✅ `POST /api/workouts { exercises: [] }` → `400` (empty exercises)
- ✅ Workout Coach returns warmup, mainWorkout, cooldown
- ✅ Nutrition Agent returns calories ≥ 1200 (guardrail)
- ✅ Both agents handle empty weight history gracefully

---

## AI Agent Evals

### Location: `evals/`

| File | Agent | Cases |
|---|---|---|
| `workout-agent-evals.json` | Workout Coach (Agent 1) | 10 |
| `nutrition-agent-evals.json` | Nutrition/Progress (Agent 2) | 10 |

### Eval Categories

| Category | Example check |
|---|---|
| Structure | `warmup.length > 0`, `calories is a number` |
| Content relevance | Weight gain tips mention progressive overload |
| Safety guardrails | `calories >= 1200`, no "diagnose" or "guaranteed" |
| Edge cases | Empty weight history, extreme user profiles |
| Timestamp validity | `generatedAt` is a valid ISO date |

### Running Evals

```bash
cd backend
npm test   # Runs agent tests which cover the same logic
# OR
npx tsx ../evals/run-evals.ts  # Full eval runner with verbose output
```

---

## Testing Limitations

| Area | Status | Notes |
|---|---|---|
| Frontend component tests | TODO | Vitest + React Testing Library not yet set up |
| E2E tests | TODO | Playwright/Cypress not yet configured |
| Backend integration tests with real DB | Partial | Tests use Supertest but some require DB connection |
| CI agent evals | Partial | Service-level agent tests run in CI; DB-dependent tests skip gracefully |

---

## Future Testing Plan

1. Add `@testing-library/react` for frontend unit tests of key components
2. Add Playwright E2E test for the demo login flow
3. Add GitHub Actions service container for PostgreSQL to enable full integration tests in CI
4. Add snapshot testing for the NutritionAgentCard component
