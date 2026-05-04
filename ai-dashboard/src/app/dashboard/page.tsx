"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '../../lib/supabase-client';
import { Activity, Key, TerminalSquare, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [orgNameInput, setOrgNameInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick stats
  const [stats, setStats] = useState({ keys: 0, logs: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return window.location.assign('/login');
      }

      setUser(session.user);

      const res = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const data = await res.json();
      
      if (data.org) {
        setOrg(data.org);
        setStats({
          keys: data.apiKeys?.length || 0,
          logs: data.logs?.length || 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!user || !orgNameInput.trim()) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ action: 'create_org', name: orgNameInput })
      });
      const data = await res.json();
      if (data.org) setOrg(data.org);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white/50">Loading workspace...</div>;

  // --- VIEW 1: ONBOARDING ---
  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Aether</h2>
          <p className="text-white/50 mb-6 text-sm">Create your organization to get started.</p>
          <input 
            type="text" 
            placeholder="e.g. Acme Corp" 
            className="w-full bg-white/[0.02] border border-white/10 text-white p-3 rounded-lg mb-4 focus:border-cyan-400/50 outline-none transition-colors"
            value={orgNameInput}
            onChange={(e) => setOrgNameInput(e.target.value)}
          />
          <button 
            onClick={createOrganization}
            className="w-full bg-cyan-100 text-slate-900 font-semibold py-3 rounded-lg hover:bg-white transition-colors"
          >
            Create Organization
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 2: OVERVIEW ---
  return (
    <div className="space-y-8">
      <header className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold text-white">{org.name} Workspace</h1>
        <p className="text-white/50 mt-1">Welcome back. Here is a high-level overview of your AI infrastructure.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric Card 1 */}
        <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Key className="h-16 w-16 text-cyan-400" />
          </div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/50 mb-1">Active API Keys</h3>
          <p className="text-4xl font-semibold text-white mb-4">{stats.keys}</p>
          <Link href="/dashboard/keys" className="text-cyan-400 text-sm font-medium hover:text-cyan-300 flex items-center gap-1">
            Manage keys <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Metric Card 2 */}
        <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="h-16 w-16 text-emerald-400" />
          </div>
          <h3 className="text-sm font-medium uppercase tracking-wider text-white/50 mb-1">Total Requests</h3>
          <p className="text-4xl font-semibold text-white mb-4">{stats.logs}</p>
          <Link href="/dashboard/logs" className="text-emerald-400 text-sm font-medium hover:text-emerald-300 flex items-center gap-1">
            View telemetry <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Call to Action Card */}
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Test your Gateway</h3>
            <p className="text-sm text-white/70">Use the interactive playground to test routing, caching, and eval flows.</p>
          </div>
          <Link href="/dashboard/playground" className="mt-4 bg-cyan-100 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2">
            <TerminalSquare className="h-4 w-4" />
            Open Playground
          </Link>
        </div>
      </div>
    </div>
  );
}
