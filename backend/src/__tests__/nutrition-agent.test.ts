import { describe, it, expect } from 'vitest';
import { generateNutritionRecommendation } from '../services/nutrition-agent.service';
import { UserProfile, ProgressRow } from '../models/types';

const mockProfile: UserProfile = {
  name: 'Test User',
  gender: 'male',
  weight: 85,
  height: 180,
  age: 28,
  activityLevel: 'moderate',
  goal: 'weight_loss',
  targetWeight: 78,
  createdAt: new Date().toISOString(),
};

// Helper to build progress row
function buildEntry(daysAgo: number, weight: number): ProgressRow {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return {
    id: `entry-${daysAgo}`,
    user_id: 'test-user',
    date: d.toISOString().split('T')[0],
    weight,
    created_at: new Date().toISOString(),
  };
}

const mockHistory: ProgressRow[] = [
  buildEntry(0, 84.5),
  buildEntry(2, 84.8),
  buildEntry(4, 85.0),
  buildEntry(7, 85.3),
  buildEntry(9, 85.5),
  buildEntry(12, 85.7),
];

describe('Nutrition / Progress Agent', () => {
  it('returns a non-empty recommendation', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(result).toBeDefined();
  });

  it('includes calories field', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.calories).toBe('number');
    expect(result.calories).toBeGreaterThan(0);
  });

  it('includes protein field', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.protein).toBe('number');
    expect(result.protein).toBeGreaterThan(0);
  });

  it('includes hydration field', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.hydration).toBe('string');
    expect(result.hydration).toMatch(/\d+(\.\d+)?L/);
  });

  it('includes progressFeedback as non-empty string', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.progressFeedback).toBe('string');
    expect(result.progressFeedback.length).toBeGreaterThan(10);
  });

  it('includes mealPlanSummary as non-empty string', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.mealPlanSummary).toBe('string');
    expect(result.mealPlanSummary.length).toBeGreaterThan(10);
  });

  it('never recommends below 1200 kcal (guardrail)', async () => {
    // Extreme deficit scenario
    const extremeProfile: UserProfile = {
      ...mockProfile,
      gender: 'female',
      weight: 45,
      height: 155,
      age: 70,
      activityLevel: 'sedentary',
      goal: 'weight_loss',
    };
    const result = await generateNutritionRecommendation(extremeProfile, mockHistory);
    expect(result.calories).toBeGreaterThanOrEqual(1200);
  });

  it('includes avgWeightLast7 and avgWeightPrev7 fields', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.avgWeightLast7).toBe('number');
    expect(typeof result.avgWeightPrev7).toBe('number');
  });

  it('includes a generatedAt ISO timestamp', async () => {
    const result = await generateNutritionRecommendation(mockProfile, mockHistory);
    expect(typeof result.generatedAt).toBe('string');
    expect(() => new Date(result.generatedAt)).not.toThrow();
  });

  it('handles empty weight history gracefully', async () => {
    const result = await generateNutritionRecommendation(mockProfile, []);
    expect(result).toBeDefined();
    expect(result.calories).toBeGreaterThan(0);
  });
});
