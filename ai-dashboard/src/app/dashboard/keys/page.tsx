"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase-client';
import { Key } from 'lucide-react';

export default function KeysPage() {
  const [org, setOrg] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
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
      setApiKeys(data.apiKeys || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!org) return;
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ action: 'generate_key', organization_id: org.id })
      });
      const data = await res.json();
      if (data.apiKey) setApiKeys([...apiKeys, data.apiKey]);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white/50">Loading keys...</div>;
  if (!org) return <div className="text-white/50 p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400">Please complete the organization onboarding on the Overview tab first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">API Keys</h1>
          <p className="text-sm text-white/50 mt-1">Manage the API keys used to authenticate your gateway requests.</p>
        </div>
        <button 
          onClick={generateApiKey}
          className="bg-cyan-100 text-slate-900 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white transition-colors flex items-center gap-2"
        >
          <Key className="h-4 w-4" />
          Generate New Key
        </button>
      </div>
      
      <div className="bg-[#0c1017]/80 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-sm">No API keys generated yet. Click above to create one.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{key.name}</span>
                  <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-medium">Active</span>
                </div>
                <code className="bg-black/40 border border-white/5 px-4 py-3 rounded-lg text-sm text-cyan-300 font-mono tracking-wide break-all">
                  {key.key_value}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
