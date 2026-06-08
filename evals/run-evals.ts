/**
 * SmartCoach AI Agent Evaluation Runner
 *
 * Runs evaluation cases from workout-agent-evals.json and nutrition-agent-evals.json
 * against the live backend services (no DB required — uses service functions directly).
 *
 * Run: npx tsx evals/run-evals.ts
 *
 * Or as Vitest tests: cd backend && npm test (the __tests__ directory covers these)
 */

import { generateWorkoutRecommendation } from '../backend/src/services/workout-agent.service';
import { generateNutritionRecommendation } from '../backend/src/services/nutrition-agent.service';
import workoutEvals from './workout-agent-evals.json';
import nutritionEvals from './nutrition-agent-evals.json';
import { UserProfile, ProgressRow } from '../backend/src/models/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EvalResult {
  caseId: string;
  description: string;
  passed: boolean;
  checks: { name: string; passed: boolean; detail?: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function checkNotEmpty(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
}

function checkIsISODate(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return !isNaN(new Date(value).getTime());
}

function checkMatches(value: unknown, pattern: string): boolean {
  if (typeof value !== 'string') return false;
  return new RegExp(pattern).test(value);
}

// ── Workout Agent Eval ────────────────────────────────────────────────────────

async function runWorkoutEvals(): Promise<EvalResult[]> {
  const results: EvalResult[] = [];

  for (const evalCase of workoutEvals.cases) {
    const profile = evalCase.input.profile as unknown as UserProfile;
    const result = await generateWorkoutRecommendation(
      profile,
      [],
      evalCase.input.equipment,
      evalCase.input.constraints
    );

    const checks: { name: string; passed: boolean; detail?: string }[] = [
      { name: 'warmup is non-empty', passed: result.warmup.length > 0 },
      { name: 'mainWorkout is non-empty', passed: result.mainWorkout.length > 0 },
      { name: 'cooldown is non-empty', passed: result.cooldown.length > 0 },
      { name: 'weeklyPlan is non-empty', passed: checkNotEmpty(result.weeklyPlan) },
      { name: 'tips is non-empty', passed: checkNotEmpty(result.tips) },
      { name: 'generatedAt is ISO date', passed: checkIsISODate(result.generatedAt) },
      {
        name: 'no dangerous medical terms',
        passed: !JSON.stringify(result).toLowerCase().includes('diagnose') &&
                !JSON.stringify(result).toLowerCase().includes('prescription') &&
                !JSON.stringify(result).toLowerCase().includes('guaranteed to cure'),
      },
      {
        name: 'all exercises have names',
        passed: result.mainWorkout.every((ex) => ex.name && ex.name.length > 0),
      },
    ];

    results.push({
      caseId: evalCase.id,
      description: evalCase.description,
      passed: checks.every((c) => c.passed),
      checks,
    });
  }

  return results;
}

// ── Nutrition Agent Eval ──────────────────────────────────────────────────────

async function runNutritionEvals(): Promise<EvalResult[]> {
  const results: EvalResult[] = [];

  for (const evalCase of nutritionEvals.cases) {
    const profile = evalCase.input.profile as unknown as UserProfile;
    const weightHistory = evalCase.input.weightHistory as unknown as ProgressRow[];
    const result = await generateNutritionRecommendation(profile, weightHistory);

    const checks: { name: string; passed: boolean; detail?: string }[] = [
      { name: 'calories is a number', passed: typeof result.calories === 'number' },
      { name: 'calories >= 1200 (guardrail)', passed: result.calories >= 1200 },
      { name: 'protein is a number', passed: typeof result.protein === 'number' && result.protein > 0 },
      { name: 'hydration format correct', passed: checkMatches(result.hydration, '\\d+(\\.\\d+)?L') },
      { name: 'progressFeedback is non-empty', passed: checkNotEmpty(result.progressFeedback) },
      { name: 'mealPlanSummary is non-empty', passed: checkNotEmpty(result.mealPlanSummary) },
      { name: 'generatedAt is ISO date', passed: checkIsISODate(result.generatedAt) },
      {
        name: 'adjustment within ±300 kcal',
        passed: Math.abs(result.adjustment) <= 300,
        detail: `adjustment = ${result.adjustment}`,
      },
      {
        name: 'no dangerous dietary claims',
        passed: !JSON.stringify(result).toLowerCase().includes('guaranteed') &&
                !JSON.stringify(result).toLowerCase().includes('detox'),
      },
    ];

    results.push({
      caseId: evalCase.id,
      description: evalCase.description,
      passed: checks.every((c) => c.passed),
      checks,
    });
  }

  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔬 SmartCoach AI Agent Evals\n' + '='.repeat(50));

  console.log('\n📋 Workout Coach Agent (Agent 1)\n' + '-'.repeat(40));
  const workoutResults = await runWorkoutEvals();
  let workoutPassed = 0;
  for (const r of workoutResults) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [${r.caseId}] ${r.description}`);
    if (!r.passed) {
      r.checks.filter((c) => !c.passed).forEach((c) => {
        console.log(`   ⚠️  FAIL: ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
      });
    }
    if (r.passed) workoutPassed++;
  }
  console.log(`\nWorkout Agent: ${workoutPassed}/${workoutResults.length} passed`);

  console.log('\n📋 Nutrition / Progress Agent (Agent 2)\n' + '-'.repeat(40));
  const nutritionResults = await runNutritionEvals();
  let nutritionPassed = 0;
  for (const r of nutritionResults) {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${icon} [${r.caseId}] ${r.description}`);
    if (!r.passed) {
      r.checks.filter((c) => !c.passed).forEach((c) => {
        console.log(`   ⚠️  FAIL: ${c.name}${c.detail ? ` (${c.detail})` : ''}`);
      });
    }
    if (r.passed) nutritionPassed++;
  }
  console.log(`\nNutrition Agent: ${nutritionPassed}/${nutritionResults.length} passed`);

  const total = workoutResults.length + nutritionResults.length;
  const totalPassed = workoutPassed + nutritionPassed;
  console.log('\n' + '='.repeat(50));
  console.log(`📊 TOTAL: ${totalPassed}/${total} eval cases passed`);

  if (totalPassed < total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Eval runner error:', err);
  process.exit(1);
});
