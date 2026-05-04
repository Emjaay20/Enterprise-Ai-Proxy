"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ArrowRight, TerminalSquare } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase-client';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, [pathname]);

  const checkSession = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  // If we are on the login page, we might want a minimal header, but keeping it unified is fine.
  
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b12]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-4 md:px-6">
        
        {/* Left Side: Brand & Main Navigation */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="inline-flex items-center text-lg font-bold uppercase tracking-tight text-white flex-shrink-0"
          >
            Aether Control
          </Link>

          <nav className="hidden md:flex items-center gap-6 border-l border-white/10 pl-6 h-8">
            <Link
              href="/docs"
              className={`text-sm font-medium transition-colors flex items-center gap-2 ${
                pathname.startsWith('/docs') ? 'text-cyan-300' : 'text-white/60 hover:text-white'
              }`}
            >
              <TerminalSquare className="h-4 w-4" />
              Documentation
            </Link>
          </nav>
        </div>

        {/* Right Side: Auth & Actions */}
        <div className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    Console Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    title="Sign Out"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] text-white/75 transition hover:text-red-400 hover:border-red-400/50"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="hidden sm:block text-sm font-medium text-white/60 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/login"
                    className="h-9 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-100 px-4 text-sm font-semibold text-slate-900 transition hover:bg-white"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        
      </div>
    </header>
  );
}
