/**
 * Frontend API client for the SmartCoach local backend.
 *
 * All requests go to VITE_API_BASE_URL (default: http://localhost:3001/api).
 * The userId is stored in localStorage after demo login.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api';

// ── Types (mirrored from backend) ─────────────────────────────────────────────

export interface ApiUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface ApiProfile {
  name: string;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'weight_loss' | 'weight_gain' | 'maintenance';
  targetWeight: number;
  createdAt: string;
}

export interface ApiWeightEntry {
  id: string;
  date: string;
  weight: number;
}

export interface ApiWorkoutSession {
  id: string;
  date: string;
  exercises: ApiExercise[];
  notes: string;
}

export interface ApiExercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  duration?: number;
  distance?: number;
}

export interface ApiNutritionResult {
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

export interface ApiWorkoutRecommendation {
  warmup: string[];
  mainWorkout: { name: string; sets?: number; reps?: number; duration?: number; notes?: string }[];
  cooldown: string[];
  weeklyPlan: string;
  tips: string;
  generatedAt: string;
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `API error ${res.status}`);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  demoLogin: (email: string, password: string) =>
    apiFetch<ApiUser>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ── Profile ───────────────────────────────────────────────────────────────────

export const profileApi = {
  get: (userId: string) => apiFetch<ApiProfile>(`/profile/${userId}`),
  upsert: (userId: string, profile: ApiProfile) =>
    apiFetch<{ success: boolean }>(`/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),
};

// ── Workouts ──────────────────────────────────────────────────────────────────

export const workoutsApi = {
  list: (userId: string) => apiFetch<ApiWorkoutSession[]>(`/workouts/${userId}`),
  create: (userId: string, session: Omit<ApiWorkoutSession, 'id'>) =>
    apiFetch<ApiWorkoutSession>('/workouts', {
      method: 'POST',
      body: JSON.stringify({ userId, ...session }),
    }),
  update: (id: string, session: Partial<ApiWorkoutSession>) =>
    apiFetch<{ success: boolean }>(`/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(session),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/workouts/${id}`, { method: 'DELETE' }),
};

// ── Progress ──────────────────────────────────────────────────────────────────

export const progressApi = {
  list: (userId: string) => apiFetch<ApiWeightEntry[]>(`/progress/${userId}`),
  add: (userId: string, entry: Omit<ApiWeightEntry, 'id'>) =>
    apiFetch<ApiWeightEntry>('/progress', {
      method: 'POST',
      body: JSON.stringify({ userId, ...entry }),
    }),
  update: (id: string, weight: number) =>
    apiFetch<{ success: boolean }>(`/progress/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ weight }),
    }),
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/progress/${id}`, { method: 'DELETE' }),
};

// ── Agents ────────────────────────────────────────────────────────────────────

export const agentsApi = {
  nutritionProgress: (userId: string) =>
    apiFetch<ApiNutritionResult>('/agents/nutrition-progress', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  workoutCoach: (userId: string, equipment?: string, constraints?: string) =>
    apiFetch<ApiWorkoutRecommendation>('/agents/workout-coach', {
      method: 'POST',
      body: JSON.stringify({ userId, equipment, constraints }),
    }),
};

// ── LocalStorage helpers ──────────────────────────────────────────────────────

export const localAuth = {
  save: (user: ApiUser) => localStorage.setItem('smartcoach_user', JSON.stringify(user)),
  load: (): ApiUser | null => {
    try {
      const raw = localStorage.getItem('smartcoach_user');
      return raw ? (JSON.parse(raw) as ApiUser) : null;
    } catch {
      return null;
    }
  },
  clear: () => localStorage.removeItem('smartcoach_user'),
};
