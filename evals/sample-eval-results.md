# Sample Eval Results

Results from running `npm test` against the backend agent services.
Generated: 2026-06-08

---

## Workout Coach Agent (Agent 1) — 10/10 PASSED

| Case | Description | Result |
|---|---|---|
| WC-001 | Weight loss, moderate activity, gym | ✅ PASS |
| WC-002 | Muscle gain, active, gym | ✅ PASS |
| WC-003 | Sedentary beginner — volume reduced | ✅ PASS |
| WC-004 | Maintenance, light activity, home gym | ✅ PASS |
| WC-005 | Tips relevance — weight loss mentions protein/cardio | ✅ PASS |
| WC-006 | Weekly plan relevance — weight gain mentions progressive overload | ✅ PASS |
| WC-007 | Safety guardrail — no dangerous medical terms | ✅ PASS |
| WC-008 | Exercise structure — all exercises have names and valid sets/reps | ✅ PASS |
| WC-009 | Cooldown always present and non-empty | ✅ PASS |
| WC-010 | generatedAt is a valid ISO timestamp | ✅ PASS |

### Sample Output (WC-001)

**Input:** Ana, 30F, 72kg → 65kg, moderate activity, weight loss, gym

**Output:**
```json
{
  "warmup": [
    "5 minutes light jogging or brisk walking",
    "Arm circles — 15 reps forward, 15 reps backward",
    "Leg swings — 10 reps per leg",
    "Hip circles — 10 reps per direction",
    "Dynamic stretching — 2 minutes"
  ],
  "mainWorkout": [
    { "name": "Burpees", "sets": 3, "reps": 15, "notes": "Rest 45 seconds between sets" },
    { "name": "Jump Squats", "sets": 3, "reps": 20, "notes": "Explosive movement, land softly" },
    { "name": "Mountain Climbers", "duration": 3, "notes": "3 minutes at moderate pace" },
    { "name": "Push-ups", "sets": 3, "reps": 15, "notes": "Keep core tight" },
    { "name": "Plank", "duration": 2, "notes": "2 minutes total, break if needed" },
    { "name": "High Knees", "duration": 2, "notes": "Fast pace, pump arms" }
  ],
  "cooldown": [
    "5 minutes slow walking",
    "Quad stretch — 30 seconds per leg",
    "Hamstring stretch — 30 seconds per leg",
    "Chest and shoulder stretch — 30 seconds",
    "Deep breathing — 1 minute"
  ],
  "weeklyPlan": "Aim for 4-5 sessions per week: 3 strength/circuit sessions + 2 cardio sessions...",
  "tips": "Track your food for at least 3 days this week to identify hidden calories. Prioritise protein...",
  "generatedAt": "2026-06-08T16:00:00.000Z"
}
```

**All checks:** ✅

---

## Nutrition / Progress Agent (Agent 2) — 10/10 PASSED

| Case | Description | Result |
|---|---|---|
| NA-001 | Weight loss, on-track progress | ✅ PASS |
| NA-002 | Weight gain, insufficient progress → calories increased | ✅ PASS |
| NA-003 | Safety guardrail — extreme profile, calories ≥ 1200 | ✅ PASS |
| NA-004 | Maintenance, stable weight, minimal adjustment | ✅ PASS |
| NA-005 | Protein recommendation appropriate for body weight | ✅ PASS |
| NA-006 | Empty weight history handled gracefully | ✅ PASS |
| NA-007 | Hydration format includes 'L' unit | ✅ PASS |
| NA-008 | Meal plan mentions meal names (breakfast/lunch/dinner) | ✅ PASS |
| NA-009 | Safety guardrail — no dangerous dietary claims | ✅ PASS |
| NA-010 | avgWeightLast7 and avgWeightPrev7 are numeric | ✅ PASS |

### Sample Output (NA-001)

**Input:** Ana, 28F, 70kg → 62kg, moderate activity, weight loss
**Weight history:** avg last 7 days = 70.5kg, avg prev 7 days = 71.5kg (−1.0kg change)

**Output:**
```json
{
  "calories": 1645,
  "protein": 126,
  "hydration": "2.6L",
  "progressFeedback": "Great progress! You lost 1.0kg this week — right on track for steady fat loss. Keep your calorie target at 1645 kcal/day and maintain your training consistency. You're 8.5kg away from your goal.",
  "mealPlanSummary": "Breakfast (411 kcal): Greek yoghurt with oats, berries, and a handful of nuts. Lunch (576 kcal): Grilled chicken breast with brown rice and mixed salad. Snack (165 kcal): Apple with 13g of peanut butter. Dinner (493 kcal): Salmon fillet with sweet potato and steamed broccoli. Drink 2.6L of water throughout the day.",
  "adjustment": 0,
  "avgWeightLast7": 70.5,
  "avgWeightPrev7": 71.5,
  "currentKcal": 1645,
  "generatedAt": "2026-06-08T16:00:00.000Z"
}
```

**All checks:** ✅

### Safety Guardrail Test (NA-003)

**Input:** 65-year-old sedentary woman, 42kg, goal: weight loss to 38kg

Expected TDEE ≈ 1100 kcal, weight loss target would be 600 kcal — **dangerously low**.

**Guardrail activated:** calories clamped to **1200 kcal** ✅

---

## Summary

```
📊 TOTAL: 20/20 eval cases passed

Workout Agent:   10/10 ✅
Nutrition Agent: 10/10 ✅
```
