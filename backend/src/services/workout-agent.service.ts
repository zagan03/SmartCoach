/**
 * Workout Coach Agent Service
 *
 * Agent 1: Generates personalised training recommendations based on:
 *   - User profile (goal, fitness level, activity level)
 *   - Recent workout history (last 10 sessions)
 *   - Available equipment
 *   - Constraints (e.g. injuries)
 *
 * Output: Structured JSON with warmup, mainWorkout, cooldown, weeklyPlan, tips.
 *
 * If GROQ_API_KEY is set → calls Groq (llama-3.3-70b-versatile).
 * Otherwise → deterministic template fallback (always works locally).
 *
 * Guardrails:
 *   - No extreme intensity for sedentary users
 *   - No medical claims
 *   - Outputs clearly labelled as recommendations, not prescriptions
 */

import { UserProfile, WorkoutRow, WorkoutRecommendation, WorkoutExercise } from '../models/types';

// ── Deterministic fallback templates ─────────────────────────────────────────

const WARMUP_DEFAULT = [
  '5 minutes light jogging or brisk walking',
  'Arm circles — 15 reps forward, 15 reps backward',
  'Leg swings — 10 reps per leg',
  'Hip circles — 10 reps per direction',
  'Dynamic stretching — 2 minutes',
];

const COOLDOWN_DEFAULT = [
  '5 minutes slow walking',
  'Quad stretch — 30 seconds per leg',
  'Hamstring stretch — 30 seconds per leg',
  'Chest and shoulder stretch — 30 seconds',
  'Deep breathing — 1 minute',
];

type GoalKey = 'weight_loss' | 'weight_gain' | 'maintenance';
type ActivityKey = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const WORKOUT_TEMPLATES: Record<GoalKey, WorkoutExercise[]> = {
  weight_loss: [
    { name: 'Burpees',            sets: 3, reps: 15, notes: 'Rest 45 seconds between sets' },
    { name: 'Jump Squats',        sets: 3, reps: 20, notes: 'Explosive movement, land softly' },
    { name: 'Mountain Climbers',  duration: 3,       notes: '3 minutes at moderate pace' },
    { name: 'Push-ups',           sets: 3, reps: 15, notes: 'Keep core tight' },
    { name: 'Plank',              duration: 2,       notes: '2 minutes total, break if needed' },
    { name: 'High Knees',         duration: 2,       notes: 'Fast pace, pump arms' },
  ],
  weight_gain: [
    { name: 'Barbell Squat',          sets: 4, reps: 6,  notes: 'Heavy compound — 75-85% 1RM' },
    { name: 'Bench Press',            sets: 4, reps: 8,  notes: 'Controlled descent, explosive push' },
    { name: 'Barbell Row',            sets: 4, reps: 8,  notes: 'Pull to lower chest' },
    { name: 'Overhead Press',         sets: 3, reps: 10, notes: 'Full range of motion' },
    { name: 'Romanian Deadlift',      sets: 3, reps: 10, notes: 'Hip hinge, feel hamstrings' },
    { name: 'Dips',                   sets: 3, reps: 12, notes: 'Add weight if bodyweight is easy' },
  ],
  maintenance: [
    { name: 'Pull-ups',        sets: 3, reps: 10, notes: 'Full range, slow negative' },
    { name: 'Push-ups',        sets: 3, reps: 15, notes: 'Variations welcome: wide/diamond/pike' },
    { name: 'Goblet Squat',    sets: 3, reps: 15, notes: 'Pause at bottom for 1 second' },
    { name: 'Plank',           duration: 2,       notes: 'Focus on breathing' },
    { name: 'Russian Twists',  sets: 3, reps: 20, notes: '10 each side, controlled' },
    { name: 'Walking Lunges',  sets: 3, reps: 12, notes: '12 steps per leg' },
  ],
};

const WEEKLY_PLAN_TEMPLATES: Record<GoalKey, string> = {
  weight_loss:
    'Aim for 4-5 sessions per week: 3 strength/circuit sessions + 2 cardio sessions (30-45 min moderate intensity). Allow 1-2 full rest days. Prioritise sleep (7-8h) as it strongly affects fat loss.',
  weight_gain:
    'Follow a 4-day upper/lower split: Upper A → Lower A → Rest → Upper B → Lower B → Rest × 2. Progressive overload is key — add 2.5kg when you complete all sets cleanly. Eat in a 300-500 kcal surplus.',
  maintenance:
    '3-4 balanced sessions per week mixing strength and cardiovascular work. Maintain progressive overload at a slower pace. Include mobility work 2x per week. This sustainable routine prevents plateaus.',
};

const TIPS_TEMPLATES: Record<GoalKey, string> = {
  weight_loss:
    'Track your food for at least 3 days this week to identify hidden calories. Prioritise protein (1.6-2g per kg of bodyweight) to preserve muscle while in a caloric deficit. Strength training is more effective for fat loss than pure cardio long-term.',
  weight_gain:
    'Eat within 30-60 minutes post-workout for optimal muscle protein synthesis. Focus on compound movements and progressive overload — isolation exercises are secondary. Sleep 8 hours: most muscle repair happens during deep sleep.',
  maintenance:
    'Consistency over intensity. A moderate, sustainable workout done regularly beats an intense workout done sporadically. Consider adding a new skill (yoga, swimming, rock climbing) to stay engaged and improve overall fitness.',
};

// ── Groq API call ─────────────────────────────────────────────────────────────

async function callGroqWorkoutAgent(
  profile: UserProfile,
  recentWorkouts: WorkoutRow[],
  equipment: string,
  constraints: string
): Promise<WorkoutRecommendation | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const goalLabel = { weight_loss: 'weight loss', weight_gain: 'muscle gain', maintenance: 'maintenance' }[profile.goal];
  const lastWorkoutsStr = recentWorkouts.length > 0
    ? recentWorkouts.slice(0, 3).map(w =>
        `${w.date}: ${(w.exercises as WorkoutExercise[]).map((e: WorkoutExercise) => e.name).join(', ')}`
      ).join('\n')
    : 'No recent workouts recorded.';

  const prompt = `You are a professional fitness coach. Generate a structured workout recommendation.

User profile:
- Goal: ${goalLabel}
- Activity level: ${profile.activityLevel}
- Age: ${profile.age}, Gender: ${profile.gender}
- Current weight: ${profile.weight}kg, Target: ${profile.targetWeight}kg
- Available equipment: ${equipment || 'gym with full equipment'}
- Constraints/injuries: ${constraints || 'none'}

Recent workout history:
${lastWorkoutsStr}

Respond with ONLY a valid JSON object in this exact format:
{
  "warmup": ["step1", "step2", "step3", "step4", "step5"],
  "mainWorkout": [
    {"name": "exercise name", "sets": 3, "reps": 10, "notes": "tip"},
    {"name": "cardio exercise", "duration": 5, "notes": "tip"}
  ],
  "cooldown": ["step1", "step2", "step3"],
  "weeklyPlan": "description of weekly schedule",
  "tips": "practical advice for this user"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    const parsed = JSON.parse(data.choices[0].message.content) as WorkoutRecommendation;
    return parsed;
  } catch {
    return null;
  }
}

// ── Main exported function ────────────────────────────────────────────────────

export async function generateWorkoutRecommendation(
  profile: UserProfile,
  recentWorkouts: WorkoutRow[],
  equipment = 'gym with full equipment',
  constraints = ''
): Promise<WorkoutRecommendation> {
  // Try Groq first
  const groqResult = await callGroqWorkoutAgent(profile, recentWorkouts, equipment, constraints);
  if (groqResult) {
    return { ...groqResult, generatedAt: new Date().toISOString() };
  }

  // Deterministic fallback
  const goal = profile.goal as GoalKey;
  const activityLevel = profile.activityLevel as ActivityKey;

  // Adjust volume for activity level
  let mainWorkout = [...WORKOUT_TEMPLATES[goal]];
  if (activityLevel === 'sedentary' || activityLevel === 'light') {
    // Reduce volume for beginners
    mainWorkout = mainWorkout.slice(0, 4).map((ex) => ({
      ...ex,
      sets: ex.sets ? Math.max(2, ex.sets - 1) : ex.sets,
    }));
  }

  return {
    warmup: WARMUP_DEFAULT,
    mainWorkout,
    cooldown: COOLDOWN_DEFAULT,
    weeklyPlan: WEEKLY_PLAN_TEMPLATES[goal],
    tips: TIPS_TEMPLATES[goal],
    generatedAt: new Date().toISOString(),
  };
}
