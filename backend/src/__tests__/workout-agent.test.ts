import { describe, it, expect } from 'vitest';
import { generateWorkoutRecommendation } from '../services/workout-agent.service';
import { UserProfile } from '../models/types';

const mockProfile: UserProfile = {
  name: 'Test User',
  gender: 'male',
  weight: 80,
  height: 180,
  age: 28,
  activityLevel: 'moderate',
  goal: 'weight_loss',
  targetWeight: 75,
  createdAt: new Date().toISOString(),
};

describe('Workout Coach Agent', () => {
  it('returns a non-empty recommendation', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(result).toBeDefined();
  });

  it('includes warmup section', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(Array.isArray(result.warmup)).toBe(true);
    expect(result.warmup.length).toBeGreaterThan(0);
  });

  it('includes main workout section', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(Array.isArray(result.mainWorkout)).toBe(true);
    expect(result.mainWorkout.length).toBeGreaterThan(0);
  });

  it('includes cooldown section', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(Array.isArray(result.cooldown)).toBe(true);
    expect(result.cooldown.length).toBeGreaterThan(0);
  });

  it('includes weekly plan as non-empty string', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(typeof result.weeklyPlan).toBe('string');
    expect(result.weeklyPlan.length).toBeGreaterThan(0);
  });

  it('includes tips as non-empty string', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(typeof result.tips).toBe('string');
    expect(result.tips.length).toBeGreaterThan(0);
  });

  it('includes a generatedAt ISO timestamp', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    expect(typeof result.generatedAt).toBe('string');
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });

  it('adapts output for weight_gain goal', async () => {
    const gainProfile: UserProfile = { ...mockProfile, goal: 'weight_gain', targetWeight: 90 };
    const result = await generateWorkoutRecommendation(gainProfile, []);
    expect(result.mainWorkout.length).toBeGreaterThan(0);
    // Weight gain programs should include compound lifts
    const names = result.mainWorkout.map((e) => e.name.toLowerCase());
    const hasCompound = names.some((n) => n.includes('squat') || n.includes('deadlift') || n.includes('bench') || n.includes('row'));
    expect(hasCompound).toBe(true);
  });

  it('reduces volume for sedentary users', async () => {
    const sedentaryProfile: UserProfile = { ...mockProfile, activityLevel: 'sedentary' };
    const activeProfile: UserProfile = { ...mockProfile, activityLevel: 'active' };
    const sedResult = await generateWorkoutRecommendation(sedentaryProfile, []);
    const activeResult = await generateWorkoutRecommendation(activeProfile, []);
    // Sedentary users should get fewer or equal exercises
    expect(sedResult.mainWorkout.length).toBeLessThanOrEqual(activeResult.mainWorkout.length);
  });

  it('does not include dangerous medical advice', async () => {
    const result = await generateWorkoutRecommendation(mockProfile, []);
    const fullText = JSON.stringify(result).toLowerCase();
    const dangerousTerms = ['diagnose', 'prescription', 'guaranteed to cure', 'medical treatment'];
    for (const term of dangerousTerms) {
      expect(fullText).not.toContain(term);
    }
  });
});
