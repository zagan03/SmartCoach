/**
 * Nutrition / Progress Agent Service
 *
 * Agent 2: Provides nutrition and progress feedback based on:
 *   - User profile (goal, activity level, weight/height/age)
 *   - Weight history (last 14 days)
 *   - Preferences and constraints
 *
 * Output: Structured JSON with calories, protein, hydration,
 *         progressFeedback, mealPlanSummary, adjustment.
 *
 * If GROQ_API_KEY is set → calls Groq (llama-3.3-70b-versatile).
 * Otherwise → deterministic calculation-based fallback.
 *
 * Guardrails:
 *   - Minimum 1200 kcal recommended (never below)
 *   - Maximum single adjustment ±300 kcal per week
 *   - No extreme medical claims
 *   - Responses marked as recommendations, not prescriptions
 */

import { UserProfile, ProgressRow, NutritionRecommendation } from '../models/types';

// ── Caloric calculations (Mifflin-St Jeor) ───────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function calculateBMR(profile: UserProfile): number {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return profile.gender === 'male' ? base + 5 : base - 161;
}

function calculateTDEE(profile: UserProfile): number {
  return Math.round(calculateBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

function calculateRecommendedKcal(profile: UserProfile): number {
  const tdee = calculateTDEE(profile);
  if (profile.goal === 'weight_loss') return Math.max(1200, tdee - 500);
  if (profile.goal === 'weight_gain') return tdee + 300;
  return tdee;
}

// ── Helper: compute weekly averages ──────────────────────────────────────────

function computeWeeklyAverages(
  profile: UserProfile,
  weightHistory: ProgressRow[]
): { avgLast7: number; avgPrev7: number } {
  const today = new Date();
  const sorted = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));

  const last7 = sorted.filter((e) => {
    const diff = (today.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const prev7 = sorted.filter((e) => {
    const diff = (today.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  });

  const avgLast7 =
    last7.length > 0
      ? last7.reduce((s, e) => s + Number(e.weight), 0) / last7.length
      : profile.weight;
  const avgPrev7 =
    prev7.length > 0
      ? prev7.reduce((s, e) => s + Number(e.weight), 0) / prev7.length
      : profile.weight;

  return {
    avgLast7: Math.round(avgLast7 * 10) / 10,
    avgPrev7: Math.round(avgPrev7 * 10) / 10,
  };
}

// ── Groq API call ─────────────────────────────────────────────────────────────

async function callGroqNutritionAgent(
  profile: UserProfile,
  avgLast7: number,
  avgPrev7: number,
  currentKcal: number,
  adjustment: number
): Promise<NutritionRecommendation | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const goalLabel = {
    weight_loss: 'weight loss',
    weight_gain: 'muscle gain',
    maintenance: 'maintenance',
  }[profile.goal];

  const weeklyChange = avgLast7 - avgPrev7;
  const newKcal = currentKcal + adjustment;
  const protein = Math.round(profile.weight * 1.8);
  const hydration = `${Math.round((profile.weight * 0.033 + (profile.activityLevel === 'active' || profile.activityLevel === 'very_active' ? 0.5 : 0)) * 10) / 10}L`;

  const prompt = `You are a professional nutrition coach. Generate structured nutrition advice.

User profile:
- Goal: ${goalLabel}
- Weight last week avg: ${avgPrev7}kg, this week avg: ${avgLast7}kg (change: ${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}kg)
- Target weight: ${profile.targetWeight}kg
- Current calorie target: ${currentKcal} kcal/day
- Suggested new target: ${newKcal} kcal/day (adjustment: ${adjustment >= 0 ? '+' : ''}${adjustment} kcal)
- Recommended protein: ${protein}g/day
- Recommended hydration: ${hydration}/day

Respond with ONLY a valid JSON object in this exact format:
{
  "progressFeedback": "2-3 sentences about this week's progress",
  "mealPlanSummary": "brief sample meal plan for today (breakfast, lunch, dinner, snacks)"
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
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { choices: { message: { content: string } }[] };
    const parsed = JSON.parse(data.choices[0].message.content) as { progressFeedback: string; mealPlanSummary: string };
    return {
      calories: newKcal,
      protein,
      hydration,
      progressFeedback: parsed.progressFeedback,
      mealPlanSummary: parsed.mealPlanSummary,
      adjustment,
      avgWeightLast7: avgLast7,
      avgWeightPrev7: avgPrev7,
      currentKcal,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ── Deterministic fallback ────────────────────────────────────────────────────

function buildDeterministicRecommendation(
  profile: UserProfile,
  avgLast7: number,
  avgPrev7: number,
  currentKcal: number,
  adjustment: number
): NutritionRecommendation {
  const weeklyChange = avgLast7 - avgPrev7;
  const newKcal = currentKcal + adjustment;
  const protein = Math.round(profile.weight * 1.8);
  const hydrationLitres = Math.round((profile.weight * 0.033 + 0.3) * 10) / 10;
  const hydration = `${hydrationLitres}L`;

  let progressFeedback: string;
  if (profile.goal === 'weight_loss') {
    if (weeklyChange < -0.3) {
      progressFeedback = `Great progress! You lost ${Math.abs(weeklyChange).toFixed(1)}kg this week — right on track for steady fat loss. Keep your calorie target at ${newKcal} kcal/day and maintain your training consistency. You're ${Math.abs(avgLast7 - profile.targetWeight).toFixed(1)}kg away from your goal.`;
    } else if (weeklyChange > 0.3) {
      progressFeedback = `You gained ${weeklyChange.toFixed(1)}kg this week. This could be water retention, muscle gain, or a slight surplus. We're reducing your calorie target by ${Math.abs(adjustment)} kcal to ${newKcal} kcal/day. Focus on tracking your meals accurately and staying consistent with training.`;
    } else {
      progressFeedback = `Your weight is stable this week (change: ${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}kg). Weight loss plateaus are normal — stay consistent. Your calorie target stays at ${newKcal} kcal/day. Ensure you're hitting your protein goal of ${protein}g/day.`;
    }
  } else if (profile.goal === 'weight_gain') {
    if (weeklyChange > 0.2) {
      progressFeedback = `Solid gaining week! You added ${weeklyChange.toFixed(1)}kg — steady muscle-focused progress. Keep your intake at ${newKcal} kcal/day and prioritise compound lifts. ${Math.abs(profile.targetWeight - avgLast7).toFixed(1)}kg left to your target.`;
    } else {
      progressFeedback = `Weight gain is slower than ideal this week (${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}kg). We're increasing your target by ${adjustment} kcal to ${newKcal} kcal/day. Add a protein shake or an extra snack to hit the new target. Make sure you're training with progressive overload.`;
    }
  } else {
    progressFeedback = `Maintenance is going well. Your weight is stable (${weeklyChange >= 0 ? '+' : ''}${weeklyChange.toFixed(1)}kg this week). Stay around ${newKcal} kcal/day and keep training consistently. Focus on performance improvements (strength, endurance) rather than scale changes.`;
  }

  const mealPlanSummary = `Breakfast (${Math.round(newKcal * 0.25)} kcal): Greek yoghurt with oats, berries, and a handful of nuts. Lunch (${Math.round(newKcal * 0.35)} kcal): Grilled chicken breast with brown rice and mixed salad. Snack (${Math.round(newKcal * 0.1)} kcal): Apple with ${Math.round(protein * 0.1)}g of peanut butter. Dinner (${Math.round(newKcal * 0.3)} kcal): Salmon fillet with sweet potato and steamed broccoli. Drink ${hydration} of water throughout the day.`;

  return {
    calories: newKcal,
    protein,
    hydration,
    progressFeedback,
    mealPlanSummary,
    adjustment,
    avgWeightLast7: avgLast7,
    avgWeightPrev7: avgPrev7,
    currentKcal,
    generatedAt: new Date().toISOString(),
  };
}

// ── Compute caloric adjustment ────────────────────────────────────────────────

function computeAdjustment(profile: UserProfile, avgLast7: number, avgPrev7: number): number {
  const weeklyChange = avgLast7 - avgPrev7;
  let adjustment = 0;

  if (profile.goal === 'weight_loss') {
    if (weeklyChange > -0.3) adjustment = -150;
  } else if (profile.goal === 'weight_gain') {
    if (weeklyChange < 0.2) adjustment = 150;
  } else {
    if (Math.abs(weeklyChange) > 0.5) {
      adjustment = weeklyChange > 0 ? -100 : 100;
    }
  }

  // Guardrail: cap adjustment
  adjustment = Math.max(-300, Math.min(300, adjustment));

  return adjustment;
}

// ── Main exported function ────────────────────────────────────────────────────

export async function generateNutritionRecommendation(
  profile: UserProfile,
  weightHistory: ProgressRow[]
): Promise<NutritionRecommendation> {
  const { avgLast7, avgPrev7 } = computeWeeklyAverages(profile, weightHistory);
  const currentKcal = calculateRecommendedKcal(profile);
  const adjustment = computeAdjustment(profile, avgLast7, avgPrev7);

  // Guardrail: never recommend below 1200 kcal
  const finalKcal = Math.max(1200, currentKcal + adjustment);
  const safeAdjustment = finalKcal - currentKcal;

  // Try Groq first
  const groqResult = await callGroqNutritionAgent(profile, avgLast7, avgPrev7, currentKcal, safeAdjustment);
  if (groqResult) return groqResult;

  // Deterministic fallback
  return buildDeterministicRecommendation(profile, avgLast7, avgPrev7, currentKcal, safeAdjustment);
}
