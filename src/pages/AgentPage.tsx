import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { agentsApi, toAgentAnalysis } from '../context/AppContext';
import { UserProfile, WeightEntry, AgentAnalysis } from '../types';
import { calculateRecommendedKcal } from '../utils/calculations';
import { NutritionAgentCard } from '../components/NutritionAgentCard';
import { useAuth } from '../context/AuthContext';

// Local computation for display purposes (keeps the UI stats in sync)
function computeLocalStats(
  profile: UserProfile,
  weightEntries: WeightEntry[]
): { avgLast7: number; avgPrev7: number } {
  const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
  const today = new Date();

  const last7 = sorted.filter((e) => {
    const diff = (today.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const prev7 = sorted.filter((e) => {
    const diff = (today.getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff > 7 && diff <= 14;
  });

  const avgLast7 =
    last7.length > 0 ? last7.reduce((s, e) => s + e.weight, 0) / last7.length : profile.weight;
  const avgPrev7 =
    prev7.length > 0 ? prev7.reduce((s, e) => s + e.weight, 0) / prev7.length : profile.weight;

  return {
    avgLast7: Math.round(avgLast7 * 10) / 10,
    avgPrev7: Math.round(avgPrev7 * 10) / 10,
  };
}

export function AgentPage() {
  const { profile, weightEntries, lastAnalysis, setLastAnalysis } = useApp();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !user) return null;

  const hasEnoughData = weightEntries.length >= 1;

  const handleRunAnalysis = async () => {
    if (!hasEnoughData) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call backend agent (which handles Groq or deterministic fallback)
      const result = await agentsApi.nutritionProgress(user.id);

      const newAnalysis: AgentAnalysis = toAgentAnalysis(result);
      await setLastAnalysis(newAnalysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare necunoscută.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = computeLocalStats(profile, weightEntries);
  const currentKcal = calculateRecommendedKcal(profile);

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="text-4xl">🤖</span> Agent Nutriție AI
          </h1>
          <p className="text-[#9ca3af] mt-2">Primește recomandări săptămânale personalizate bazate pe progresul tău.</p>
        </div>
      </div>

      {/* Stats preview */}
      {hasEnoughData && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <div className="text-[#9ca3af] text-xs mb-1">Medie săpt. trecută</div>
            <div className="text-xl font-mono font-bold">{stats.avgPrev7} kg</div>
          </div>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <div className="text-[#9ca3af] text-xs mb-1">Medie această săpt.</div>
            <div className="text-xl font-mono font-bold text-[#22c55e]">{stats.avgLast7} kg</div>
          </div>
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-4 text-center">
            <div className="text-[#9ca3af] text-xs mb-1">Kcal actuale</div>
            <div className="text-xl font-mono font-bold">{currentKcal}</div>
          </div>
        </div>
      )}

      {!hasEnoughData ? (
        <div className="bg-[#f97316] bg-opacity-10 border border-[#f97316] text-[#f97316] p-6 rounded-xl fade-in flex items-start gap-4">
          <div className="text-2xl mt-1">⚠️</div>
          <div>
            <h3 className="font-bold text-lg mb-1">Date insuficiente</h3>
            <p className="text-[#f97316] opacity-90">
              Adaugă cel puțin 1 înregistrare de greutate pentru a putea rula analiza AI. Momentan ai {weightEntries.length} înregistrări.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {error && (
            <div className="bg-[#ef4444] bg-opacity-10 border border-[#ef4444] text-[#ef4444] p-6 rounded-xl fade-in flex items-start gap-4">
              <div className="text-2xl mt-1">❌</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Eroare</h3>
                <p className="text-[#ef4444] opacity-90 mb-3">{error}</p>
                <button
                  onClick={handleRunAnalysis}
                  className="bg-[#ef4444] bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Încearcă din nou
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="bg-[#111111] border border-[#2a2a2a] p-12 rounded-xl flex flex-col items-center justify-center fade-in">
              <div className="w-12 h-12 border-4 border-[#2a2a2a] border-t-[#22c55e] rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-[#f0f0f0] font-medium">Agentul AI analizează progresul tău...</p>
              <p className="text-[#9ca3af] text-sm mt-2">Această operațiune poate dura câteva secunde.</p>
            </div>
          )}

          {!isLoading && lastAnalysis && !error && (
            <NutritionAgentCard analysis={lastAnalysis} />
          )}

          {!isLoading && !error && (
            <button
              onClick={handleRunAnalysis}
              id="run-analysis-btn"
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-6 py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.3)] w-full sm:w-auto self-center"
            >
              🪄 Rulează Analiza Săptămânală
            </button>
          )}

        </div>
      )}

    </div>
  );
}
