import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { agentsApi } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ApiWorkoutRecommendation } from '../services/api';

export function WorkoutCoachPage() {
  const { profile } = useApp();
  const { user } = useAuth();

  const [equipment, setEquipment] = useState('gym with full equipment');
  const [constraints, setConstraints] = useState('');
  const [recommendation, setRecommendation] = useState<ApiWorkoutRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile || !user) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await agentsApi.workoutCoach(user.id, equipment, constraints);
      setRecommendation(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'A apărut o eroare necunoscută.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🏋️</span> Workout Coach AI
        </h1>
        <p className="text-[#9ca3af] mt-2">
          Generează un plan de antrenament personalizat bazat pe profilul și istoricul tău.
        </p>
      </div>

      {/* Input form */}
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold">Preferințe Antrenament</h2>

        <div>
          <label className="text-[#9ca3af] text-sm font-medium mb-1 block">Echipament disponibil</label>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#22c55e] w-full"
          >
            <option value="gym with full equipment">Sală de sport completă</option>
            <option value="home gym with dumbbells and resistance bands">Home gym (gantere + benzi elastice)</option>
            <option value="bodyweight only, no equipment">Doar greutatea corporală</option>
            <option value="gym with barbells and dumbbells only">Sală cu bara și gantere</option>
          </select>
        </div>

        <div>
          <label className="text-[#9ca3af] text-sm font-medium mb-1 block">
            Constrângeri / Accidentări (opțional)
          </label>
          <input
            type="text"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Ex: durere la genunchi, evit exercițiile pentru umăr stâng..."
            className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] rounded-lg px-3 py-2 focus:outline-none focus:border-[#22c55e] w-full"
          />
        </div>

        {/* Profile summary */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-sm flex flex-wrap gap-4">
          <span className="text-[#9ca3af]">Obiectiv: <span className="text-[#22c55e] font-medium">
            {profile.goal === 'weight_loss' ? 'Slăbit' : profile.goal === 'weight_gain' ? 'Masă musculară' : 'Mentenanță'}
          </span></span>
          <span className="text-[#9ca3af]">Nivel: <span className="text-[#f0f0f0] font-medium">{profile.activityLevel}</span></span>
          <span className="text-[#9ca3af]">Vârstă: <span className="text-[#f0f0f0] font-medium">{profile.age} ani</span></span>
        </div>

        <button
          id="generate-workout-btn"
          onClick={handleGenerate}
          disabled={isLoading}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-6 py-3 rounded-xl transition-colors text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.2)] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Generează...
            </>
          ) : (
            '⚡ Generează Planul de Antrenament'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#ef4444] bg-opacity-10 border border-[#ef4444] text-[#ef4444] p-6 rounded-xl fade-in">
          <h3 className="font-bold mb-1">Eroare</h3>
          <p className="opacity-90">{error}</p>
        </div>
      )}

      {/* Results */}
      {recommendation && !isLoading && (
        <div className="flex flex-col gap-6 fade-in">

          {/* Warmup */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="bg-[#1a1a1a] px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <h3 className="font-bold">Încălzire</h3>
            </div>
            <ul className="p-5 flex flex-col gap-2">
              {recommendation.warmup.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[#d1d5db]">
                  <span className="text-[#22c55e] font-mono text-sm mt-0.5 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Main Workout */}
          <div className="bg-[#111111] border border-[#22c55e] border-opacity-30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(34,197,94,0.05)]">
            <div className="bg-[#1a1a1a] px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3">
              <span className="text-xl">💪</span>
              <h3 className="font-bold">Antrenament Principal</h3>
            </div>
            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[#9ca3af] border-b border-[#2a2a2a]">
                    <tr>
                      <th className="text-left px-2 py-2 font-medium">Exercițiu</th>
                      <th className="text-left px-2 py-2 font-medium">Volume</th>
                      <th className="text-left px-2 py-2 font-medium hidden md:table-cell">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendation.mainWorkout.map((ex, i) => (
                      <tr key={i} className="border-b border-[#2a2a2a] border-opacity-50">
                        <td className="px-2 py-3 font-medium text-[#f0f0f0]">{ex.name}</td>
                        <td className="px-2 py-3 font-mono text-[#22c55e]">
                          {ex.duration
                            ? `${ex.duration} min`
                            : `${ex.sets}×${ex.reps}`}
                        </td>
                        <td className="px-2 py-3 text-[#9ca3af] text-xs hidden md:table-cell">{ex.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cooldown */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="bg-[#1a1a1a] px-5 py-3 border-b border-[#2a2a2a] flex items-center gap-3">
              <span className="text-xl">❄️</span>
              <h3 className="font-bold">Revenire</h3>
            </div>
            <ul className="p-5 flex flex-col gap-2">
              {recommendation.cooldown.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-[#d1d5db]">
                  <span className="text-[#9ca3af] font-mono text-sm mt-0.5 shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Plan */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">📅</span>
              <h3 className="font-bold">Plan Săptămânal</h3>
            </div>
            <p className="text-[#d1d5db] leading-relaxed">{recommendation.weeklyPlan}</p>
          </div>

          {/* Tips */}
          <div className="bg-[#111111] border border-[#2a2a2a] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="font-bold">Sfaturi Personalizate</h3>
            </div>
            <p className="text-[#d1d5db] leading-relaxed">{recommendation.tips}</p>
          </div>

          {/* Footer */}
          <div className="text-center text-[#6b7280] text-xs">
            Generat la {new Date(recommendation.generatedAt).toLocaleString('ro-RO')} •
            <span className="ml-1">Aceasta este o recomandare, nu o prescripție medicală.</span>
          </div>

        </div>
      )}

    </div>
  );
}
