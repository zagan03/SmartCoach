// Shared TypeScript types for the SmartCoach backend.
// These mirror the frontend types/index.ts to maintain consistency.

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'weight_loss' | 'weight_gain' | 'maintenance';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ProfileRow {
  user_id: string;
  name: string;
  gender: Gender;
  weight: number;
  height: number;
  age: number;
  activity_level: ActivityLevel;
  goal: Goal;
  target_weight: number;
  created_at: string;
}

export interface UserProfile {
  name: string;
  gender: Gender;
  weight: number;
  height: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  targetWeight: number;
  createdAt: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets?: number;
  reps?: number;
  weightKg?: number;
  duration?: number;
  distance?: number;
}

export interface WorkoutRow {
  id: string;
  user_id: string;
  date: string;
  exercises: Exercise[];
  notes: string;
  created_at: string;
}

export interface ProgressRow {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  created_at: string;
}

export interface AgentLogRow {
  id: string;
  user_id: string;
  agent_type: 'workout-coach' | 'nutrition-progress';
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  created_at: string;
}

// Agent output types
export interface WorkoutRecommendation {
  warmup: string[];
  mainWorkout: WorkoutExercise[];
  cooldown: string[];
  weeklyPlan: string;
  tips: string;
  generatedAt: string;
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  notes?: string;
}

export interface NutritionRecommendation {
  calories: number;
  protein: number;
  hydration: string;
  progressFeedback: string;
  mealPlanSummary: string;
  adjustment: number;
  avgWeightLast7: number;
  avgWeightPrev7: number;
  currentKcal: number;
  generatedAt: string;
}
