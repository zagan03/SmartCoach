/**
 * AppContext — Local Backend Version
 *
 * Replaces Firebase Firestore calls with REST API calls to the local
 * Node.js + Express + PostgreSQL backend.
 *
 * All state management logic is preserved. Only the persistence layer changed.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, WeightEntry, WorkoutSession, AgentAnalysis } from '../types';
import { profileApi, progressApi, workoutsApi, agentsApi, ApiNutritionResult } from '../services/api';
import { useAuth } from './AuthContext';

// Convert API nutrition result → AgentAnalysis (frontend type)
function toAgentAnalysis(r: ApiNutritionResult): AgentAnalysis {
  return {
    avgWeightLast7: r.avgWeightLast7,
    avgWeightPrev7: r.avgWeightPrev7,
    currentKcal: r.currentKcal,
    suggestedKcal: r.calories,
    adjustment: r.adjustment,
    aiMessage: `${r.progressFeedback}\n\n📅 Meal Plan Today:\n${r.mealPlanSummary}\n\n💧 Hydration goal: ${r.hydration}\n🥩 Protein goal: ${r.protein}g`,
    generatedAt: r.generatedAt,
  };
}

interface AppContextType {
  profile: UserProfile | null;
  weightEntries: WeightEntry[];
  workoutSessions: WorkoutSession[];
  lastAnalysis: AgentAnalysis | null;
  isLoading: boolean;

  setProfile: (p: UserProfile) => Promise<void>;
  addWeightEntry: (entry: WeightEntry) => Promise<void>;
  editWeightEntry: (id: string, weight: number) => Promise<void>;
  removeWeightEntry: (id: string) => Promise<void>;
  addWorkoutSession: (session: WorkoutSession) => Promise<void>;
  editWorkoutSession: (session: WorkoutSession) => Promise<void>;
  removeWorkoutSession: (id: string) => Promise<void>;
  setLastAnalysis: (a: AgentAnalysis) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoadingAuth } = useAuth();
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [lastAnalysis, setLastAnalysisState] = useState<AgentAnalysis | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData(userId: string) {
      try {
        // Load profile
        try {
          const p = await profileApi.get(userId);
          setProfileState(p as unknown as UserProfile);
        } catch {
          // Profile not yet created — that's OK
        }

        // Load weight entries
        const weights = await progressApi.list(userId);
        setWeightEntries(weights as unknown as WeightEntry[]);

        // Load workouts
        const workouts = await workoutsApi.list(userId);
        setWorkoutSessions(workouts as unknown as WorkoutSession[]);
      } catch (err) {
        console.error('Error loading data from backend:', err);
      } finally {
        setIsLoadingData(false);
      }
    }

    if (isLoadingAuth) return;

    if (!user) {
      setProfileState(null);
      setWeightEntries([]);
      setWorkoutSessions([]);
      setLastAnalysisState(null);
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    loadData(user.id);
  }, [user, isLoadingAuth]);

  const setProfile = async (p: UserProfile) => {
    if (!user) return;
    setProfileState(p);
    await profileApi.upsert(user.id, p as Parameters<typeof profileApi.upsert>[1]);
  };

  const addWeightEntry = async (entry: WeightEntry) => {
    if (!user) return;
    setWeightEntries((prev) => [...prev, entry]);
    await progressApi.add(user.id, { date: entry.date, weight: entry.weight });
  };

  const editWeightEntry = async (id: string, weight: number) => {
    if (!user) return;
    setWeightEntries((prev) => prev.map((e) => (e.id === id ? { ...e, weight } : e)));
    await progressApi.update(id, weight);
  };

  const removeWeightEntry = async (id: string) => {
    if (!user) return;
    setWeightEntries((prev) => prev.filter((e) => e.id !== id));
    await progressApi.delete(id);
  };

  const addWorkoutSession = async (session: WorkoutSession) => {
    if (!user) return;
    setWorkoutSessions((prev) => [...prev, session]);
    await workoutsApi.create(user.id, {
      date: session.date,
      exercises: session.exercises as Parameters<typeof workoutsApi.create>[1]['exercises'],
      notes: session.notes,
    });
  };

  const editWorkoutSession = async (session: WorkoutSession) => {
    if (!user) return;
    setWorkoutSessions((prev) => prev.map((s) => (s.id === session.id ? session : s)));
    await workoutsApi.update(session.id, {
      date: session.date,
      exercises: session.exercises as Parameters<typeof workoutsApi.update>[1]['exercises'],
      notes: session.notes,
    });
  };

  const removeWorkoutSession = async (id: string) => {
    if (!user) return;
    setWorkoutSessions((prev) => prev.filter((s) => s.id !== id));
    await workoutsApi.delete(id);
  };

  const setLastAnalysis = async (a: AgentAnalysis) => {
    if (!user) return;
    setLastAnalysisState(a);
    // Analysis is re-generated on demand; no separate storage endpoint needed.
    // The backend logs it in agent_logs automatically.
  };

  const isLoading = isLoadingAuth || isLoadingData;

  if (isLoading && user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2a2a2a] border-t-[#22c55e] rounded-full animate-spin"></div>
          <p className="text-[#9ca3af]">Se încarcă datele tale...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        profile,
        weightEntries,
        workoutSessions,
        lastAnalysis,
        isLoading,
        setProfile,
        addWeightEntry,
        editWeightEntry,
        removeWeightEntry,
        addWorkoutSession,
        editWorkoutSession,
        removeWorkoutSession,
        setLastAnalysis,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Expose agentsApi for use in AgentPage and WorkoutCoachPage
export { agentsApi, toAgentAnalysis };

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
