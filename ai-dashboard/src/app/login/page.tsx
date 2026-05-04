"use client";

import { useState } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Bot, ChevronRight, Loader2, Github } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const supabase = getSupabaseBrowserClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! You can now log in.');
        setIsSignUp(false);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push('/dashboard');
        router.refresh(); // Refresh to update server components/layout state if needed
      }
    }
    setLoading(false);
  };

  const handleGithubLogin = async () => {
    setError('');
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_420px_at_70%_-10%,rgba(34,211,238,0.08),transparent_50%),linear-gradient(180deg,#070b12_0%,#04070d_100%)] flex items-center justify-center p-4">
      
      {/* Decorative background elements matching the landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] h-[50%] w-[50%] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo/Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
            <Bot className="h-6 w-6 text-cyan-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase font-sans">
            Aether Control
          </h1>
          <p className="text-sm text-white/50 mt-2">
            Enterprise AI Telemetry & Gateway
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-white/10 text-white p-3 rounded-lg focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-white/20"
                placeholder="name@company.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/[0.02] border border-white/10 text-white p-3 rounded-lg focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 outline-none transition-all placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-cyan-100 hover:bg-white text-slate-900 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0c1017] px-2 text-white/50">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGithubLogin}
            type="button"
            className="w-full h-11 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors mb-6"
          >
            <Github className="h-5 w-5" />
            GitHub
          </button>

          <div className="text-center text-sm text-white/50">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-cyan-300 hover:text-cyan-200 transition-colors font-medium"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
