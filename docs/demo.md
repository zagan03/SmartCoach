# Demo Guide

## What to Show

This guide walks through a complete demo of SmartCoach in ~10 minutes.

---

## 1. Start the App

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 2. Login (30 seconds)

1. Click **"⚡ Intră cu contul demo"**
2. You're logged in as `Demo User`

> **Key point:** No Firebase, no external auth service. The app uses a local PostgreSQL database.

---

## 3. Dashboard Overview (1 minute)

Point out:
- **BMR / TDEE / Calorie Target** — calculated using the Mifflin-St Jeor formula
- **Streak badge** — consecutive days with weight or workout entries
- **Latest Weight** — most recent weigh-in from the database
- **Latest Workout** — most recent session from the database
- **AI Analysis section** — shows the last nutrition analysis if available

---

## 4. Weight Journal (2 minutes)

Navigate to `/weight`:
1. Show the weight chart (Recharts) with the downward trend
2. The target weight line is shown as a reference
3. Add a new weight entry for today
4. Show it appears in the chart and the table
5. Edit the entry (click the edit icon on hover)

> **Key point:** All data is saved to PostgreSQL via `POST /api/progress`. No Firebase.

---

## 5. Workouts (2 minutes)

Navigate to `/workouts`:
1. Show the 3 existing workout sessions (Chest, Back, Legs)
2. Expand one to show the exercise table (sets × reps @ weight)
3. Click "Sesiune Nouă" and add a new session:
   - Add 2-3 exercises
   - Mix chest + cardio
   - Click Save

> **Key point:** Input validation — try entering 0 reps or negative duration, the backend rejects it.

---

## 6. Nutrition AI Agent (2 minutes)

Navigate to `/agent`:
1. Show the weekly weight stats (avg last 7 days vs previous 7 days)
2. Click **"🪄 Rulează Analiza Săptămânală"**
3. After a moment, the NutritionAgentCard appears with:
   - Weight averages
   - Calorie recommendation (with adjustment)
   - AI-generated progress feedback
   - Meal plan for today
   - Hydration goal, protein goal

> **Key point:** This calls `POST /api/agents/nutrition-progress`. If no Groq key is set, it uses a deterministic fallback — the demo **always works**.

---

## 7. Workout Coach AI Agent (2 minutes)

Navigate to `/workout-coach`:
1. Select equipment: "Sală de sport completă"
2. Leave constraints empty
3. Click **"⚡ Generează Planul de Antrenament"**
4. After a moment, show:
   - **Warmup** section (5 steps)
   - **Main Workout** table (name, sets×reps or duration, tips)
   - **Cooldown** section
   - **Weekly Plan** description
   - **Tips** personalised to the user goal

> **Key point:** Two separate AI agents, both with backend logging to `agent_logs` table.

---

## 8. Profile Edit (30 seconds)

Navigate to `/profile`:
1. Change the goal from "weight loss" to "maintenance"
2. Click Save
3. Go back to Dashboard — the calorie target has changed

---

## 9. Show the Code (1 minute)

Quick code tour:
- `backend/src/services/workout-agent.service.ts` — Agent 1 with Groq fallback
- `backend/sql/schema.sql` — clean PostgreSQL schema
- `evals/workout-agent-evals.json` — 10 structured eval cases
- `.github/workflows/ci-cd.yml` — CI/CD pipeline

---

## Known Limitations for Demo

- The demo account password is `demo1234` (not production-ready auth)
- AI agents use deterministic templates without Groq API key
- No account registration UI (only login for the pre-seeded demo user)
- Frontend tests not yet implemented (backend tests are ready)
