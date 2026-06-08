# SmartCoach — Project Backlog

## ✅ Done

| ID | Story | Notes |
|---|---|---|
| US-001 | Demo login with local credentials | Implemented via `POST /api/auth/demo-login` |
| US-002 | Session persistence via localStorage | `localAuth.save/load()` in `src/services/api.ts` |
| US-003 | 3-step profile creation wizard | `ProfilePage.tsx` — multi-step form |
| US-004 | Edit profile at any time | `ProfilePage.tsx` edit mode |
| US-005 | Record daily weight | `WeightPage.tsx` + `POST /api/progress` |
| US-006 | Weight chart with target line | `WeightChart.tsx` using Recharts |
| US-007 | Edit / delete weight entries | `PATCH /api/progress/:id`, `DELETE /api/progress/:id` |
| US-009 | Log workout with multiple exercises | `WorkoutPage.tsx` + `POST /api/workouts` |
| US-010 | Sets/reps for strength, duration for cardio | `ExerciseRow.tsx` with dynamic fields |
| US-011 | Expandable workout history | Accordion-style list in `WorkoutPage.tsx` |
| US-012 | Edit / delete workout sessions | `PUT /api/workouts/:id`, `DELETE /api/workouts/:id` |
| US-013 | Nutrition AI agent — calorie adjustment | `AgentPage.tsx` + `POST /api/agents/nutrition-progress` |
| US-014 | Workout Coach AI agent | `WorkoutCoachPage.tsx` + `POST /api/agents/workout-coach` |
| US-015 | Agents work without API key (fallback) | Deterministic templates in `*-agent.service.ts` |
| US-016 | Min 1200 kcal guardrail | Enforced in `nutrition-agent.service.ts` |
| US-017 | BMR, TDEE, daily target on dashboard | `calculations.ts` utilities + `DashboardPage.tsx` |
| US-018 | Streak badge | `StreakBadge.tsx` component |
| US-019 | Latest weight + workout on dashboard | `DashboardPage.tsx` summary cards |
| US-020 | Persistent sidebar / mobile bottom nav | `Navbar.tsx` with responsive design |

---

## 🔄 In Progress

| ID | Story | Status |
|---|---|---|
| US-008 | BMI display with current weight | Partially implemented — shown on dashboard, not on weight page directly |
| — | Backend unit tests | 5 test files written, need CI validation with real DB |
| — | Evals automated in CI | Eval JSON files ready; CI runs service-level tests |

---

## 📋 To Do

| ID | Story | Priority |
|---|---|---|
| — | `POST /api/auth/register` — create account via backend | Medium |
| — | JWT-based auth for production readiness | Low (demo uses simple localStorage auth) |
| — | Pagination for workout history (currently loads all) | Low |
| — | Offline mode / service worker | Low |
| — | Export data as CSV | Low |
| — | Add workout templates (predefined routines) | Medium |
| — | Multi-language support (English + Romanian) | Low |
| — | Dark/light mode toggle | Low |

---

## 🚀 Future Improvements

| Feature | Description |
|---|---|
| Real LLM integration | Connect Groq/OpenAI for fully dynamic AI agent responses |
| Progress photos | Allow users to upload progress photos linked to dates |
| Social / sharing | Share workout summaries with friends |
| Mobile app | React Native wrapper around the existing web app |
| Meal tracking | Log meals alongside weight for more accurate nutrition analysis |
| Wearable integration | Sync data from Apple Health / Google Fit |
| Advanced analytics | Strength progress charts, PR tracking, volume trends |
| Nutritionist review | Flag agent recommendations for human expert review |
