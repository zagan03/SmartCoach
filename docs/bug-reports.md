# Bug Reports

Three realistic bug reports prepared for GitHub Issues and Pull Requests.

---

## Bug #1 — App crashes on startup with `auth/invalid-api-key`

**Status:** ✅ RESOLVED (PR: `fix/remove-firebase-local-demo`)

**Severity:** Critical

**Description:**
When the app is cloned and started locally without a `.env` file containing Firebase credentials, it crashes immediately with `FirebaseError: Firebase: Error (auth/invalid-api-key)`. The error occurs because `src/firebase.ts` is imported at module load time and calls `initializeApp()` with `undefined` values for all config fields.

**Reproduction steps:**
1. `git clone <repo>`
2. `npm install`
3. `npm run dev`
4. Open `http://localhost:5173`
5. ❌ White screen, console shows: `FirebaseError: Firebase: Error (auth/invalid-api-key)`

**Expected behavior:**
The app starts and shows the login page.

**Actual behavior:**
The app crashes with a Firebase error. The user sees a white screen.

**Root cause:**
`src/firebase.ts` reads `import.meta.env.VITE_FIREBASE_API_KEY` which is `undefined` without a `.env` file. Firebase's `initializeApp()` throws when apiKey is empty.

**Proposed fix:**
1. Comment out the Firebase initialisation in `src/firebase.ts`
2. Replace `AuthContext.tsx` with a local demo auth implementation using `POST /api/auth/demo-login`
3. Replace `AppContext.tsx` with REST API calls to the local backend
4. Add a `demo@smartcoach.local / demo1234` seed user to the PostgreSQL database

**Suggested branch:** `fix/remove-firebase-local-demo`
**Suggested PR title:** `fix: Replace Firebase with local Node.js backend for demo compatibility`

---

## Bug #2 — Workout duration accepts invalid values (0 or negative)

**Status:** ✅ RESOLVED (backend validation in `workouts.controller.ts`)

**Severity:** Medium

**Description:**
When creating a cardio workout, it is possible to save a session with `duration: 0` or `duration: -5`. The frontend allows this because the `ExerciseRow` component only enforces minimum at form submission, and the validation message is not always shown clearly.

**Reproduction steps:**
1. Log in and navigate to `/workouts`
2. Click "Sesiune Nouă"
3. Select muscle group: "Cardio"
4. Enter duration: `0` or leave blank
5. Click "Salvează Sesiunea"
6. ❌ In the old Firebase version, the session was saved with `duration: 0`

**Expected behavior:**
The app shows an error: "Durata cardio trebuie să fie cel puțin 1 minut."

**Actual behavior (old version):**
Session is saved with `duration: 0`. The workout history shows "0 min" which is misleading.

**Backend fix:**
```typescript
if (ex.muscleGroup === 'cardio') {
  if (!ex.duration || ex.duration < 1) {
    res.status(400).json({
      error: 'Cardio exercise duration must be at least 1 minute.'
    });
    return;
  }
}
```
This validation is now enforced server-side in `backend/src/controllers/workouts.controller.ts`.

**Test added:** `backend/src/__tests__/workout.validation.test.ts` — "rejects cardio exercise with duration < 1"

**Suggested branch:** `fix/workout-duration-validation`
**Suggested PR title:** `fix: Add server-side validation for workout exercise duration and sets/reps`

---

## Bug #3 — AI agent accepts empty user goal / missing profile

**Status:** ✅ RESOLVED (backend guardrail in `agents.controller.ts`)

**Severity:** Medium

**Description:**
When a user triggers the AI agent without having a profile set up, or with a malformed request body, the agent would attempt to run and either crash or return a nonsensical response. This was especially problematic with the direct Groq API call in the old `AgentPage.tsx` — an empty prompt could result in a confusing LLM response.

**Reproduction steps:**
1. (Old version) Manually call `POST /api/agents/nutrition-progress` with `{ "userId": "" }`
2. ❌ The server crashes or returns a 500 with a generic error
3. Or navigate to `/agent` without having created a profile — the page renders but the button shows no data

**Expected behavior:**
- If `userId` is empty or invalid → `400 Bad Request: "userId is required."`
- If profile does not exist → `404 Not Found: "User profile not found. Please create a profile first."`
- If weight history is empty → `400 Bad Request: "Not enough weight data."`

**Actual behavior (old version):**
- Unhandled error, or generic 500 error
- In the browser version, an empty Groq prompt returned a hallucinated response

**Backend fix (implemented):**
```typescript
if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
  res.status(400).json({ error: 'userId is required.' });
  return;
}

const profileRow = await queryOne<ProfileRow>('SELECT * FROM profiles WHERE user_id = $1', [userId]);
if (!profileRow) {
  res.status(404).json({ error: 'User profile not found. Please create a profile first.' });
  return;
}
```

**Test added:** `backend/src/__tests__/` — agent controller tests (via Supertest for API-level validation)

**Suggested branch:** `fix/agent-input-validation`
**Suggested PR title:** `fix: Add input validation and profile existence check to AI agent endpoints`
