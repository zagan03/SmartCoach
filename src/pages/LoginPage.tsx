import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare la autentificare.';
      if (message.toLowerCase().includes('invalid') || message.toLowerCase().includes('password')) {
        setError('Email sau parolă incorecte.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await login('demo@smartcoach.local', 'demo1234');
      navigate('/dashboard');
    } catch {
      setError('Demo login failed. Make sure the backend is running: cd backend && npm run dev');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111111] border border-[#2a2a2a] rounded-2xl p-8 fade-in">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Smart<span className="text-[#22c55e]">Coach</span>
          </h1>
          <p className="text-[#9ca3af]">Conectează-te pentru a-ți salva progresul</p>
        </div>

        {/* Demo login banner */}
        <div className="bg-[#22c55e] bg-opacity-10 border border-[#22c55e] border-opacity-30 rounded-xl p-4 mb-6">
          <p className="text-[#22c55e] text-sm font-medium mb-3">🚀 Demo local — fără Firebase</p>
          <button
            id="demo-login-btn"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold px-4 py-2 rounded-lg transition-colors w-full text-sm disabled:opacity-50"
          >
            {isLoading ? '...' : '⚡ Intră cu contul demo'}
          </button>
          <p className="text-[#9ca3af] text-xs mt-2 text-center">
            demo@smartcoach.local / demo1234
          </p>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 border-b border-[#2a2a2a]" />
          <span className="text-[#9ca3af] text-xs">sau cu email</span>
          <div className="flex-1 border-b border-[#2a2a2a]" />
        </div>

        {error && (
          <div className="bg-[#ef4444] bg-opacity-10 border border-[#ef4444] text-[#ef4444] p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[#9ca3af] text-sm font-medium mb-1 block">Email</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] rounded-lg px-4 py-3 focus:outline-none focus:border-[#22c55e] w-full transition-colors"
              placeholder="nume@exemplu.com"
              required
            />
          </div>
          <div>
            <label className="text-[#9ca3af] text-sm font-medium mb-1 block">Parolă</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#1a1a1a] border border-[#2a2a2a] text-[#f0f0f0] rounded-lg px-4 py-3 focus:outline-none focus:border-[#22c55e] w-full transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-lg px-4 py-3 rounded-lg transition-colors w-full mt-4 disabled:opacity-50 flex justify-center items-center h-[52px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Intră în cont' : 'Creează cont'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[#9ca3af] text-sm">
          {isLogin ? 'Nu ai cont? ' : 'Ai deja cont? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#22c55e] hover:underline font-medium"
          >
            {isLogin ? 'Creează unul acum' : 'Conectează-te'}
          </button>
        </div>

      </div>
    </div>
  );
}
