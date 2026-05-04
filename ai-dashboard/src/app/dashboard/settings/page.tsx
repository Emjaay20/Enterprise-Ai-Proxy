"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase-client';

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return window.location.assign('/login');

      const res = await fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrg(data.org);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white/50">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Organization Settings</h1>
        <p className="text-sm text-white/50 mt-1">Manage your workspace preferences.</p>
      </div>
      
      <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5 uppercase tracking-wider">
              Workspace Name
            </label>
            <input
              type="text"
              defaultValue={org?.name || ''}
              className="w-full bg-white/[0.02] border border-white/10 text-white p-3 rounded-lg focus:border-cyan-400/50 outline-none transition-all"
            />
          </div>
          <button className="bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
