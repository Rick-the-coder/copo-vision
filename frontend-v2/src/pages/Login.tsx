import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, ShieldCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const result = await login(username.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid username or password');
    }
  };

  const handleFillDemo = () => {
    setUsername('faculty1');
    setPassword('test1234');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#071122] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#396fab_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Top Academic Bar */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-[#0c1d37]/60 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-inner">
            <GraduationCap className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide">COPO-VISION</div>
            <div className="text-[10px] text-amber-400 font-medium tracking-widest uppercase">
              Outcome-Based Education Management System
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>NBA / NAAC Accreditation Framework v2.4</span>
        </div>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-[#0c1d37] border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-b-full"></div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Faculty Authentication
            </h2>
            <p className="text-xs text-slate-400 mt-1.5">
              Enter your institutional credentials to access course attainment & student analytics
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <span className="font-semibold block">Authentication Error</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Faculty Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. faculty1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to OBE Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 text-xs font-medium border border-slate-700/60 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fill Demo Credentials (<span className="font-mono text-amber-300">faculty1</span> / <span className="font-mono text-amber-300">test1234</span>)</span>
            </button>
            <div className="text-[11px] text-slate-500 mt-2">
              Target Backend: <span className="font-mono text-slate-400">{API_BASE_URL}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-800/80 bg-[#0c1d37]/40 text-center text-xs text-slate-500 z-10">
        COPO-Vision Outcome-Based Education Analytics Platform &bull; Department of Computer Science & Engineering
      </footer>
    </div>
  );
};
