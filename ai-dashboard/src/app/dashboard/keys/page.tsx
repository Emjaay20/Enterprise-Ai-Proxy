"use client";

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase-client';
import { Key, Copy, Check, AlertTriangle, Eye } from 'lucide-react';

export default function KeysPage() {
  const [org, setOrg] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      
      if (data.rawKey) {
        // Store the raw key for one-time display
        setNewlyCreatedKey(data.rawKey);
        // Add masked key entry to the list
        setApiKeys(prev => [data.apiKey, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const dismissNewKey = () => setNewlyCreatedKey(null);

  if (loading) return <div className="text-white/50">Loading keys...</div>;
  if (!org) return <div className="text-white/50 p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400">Please complete the organization onboarding on the Overview tab first.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">API Keys</h1>
          <p className="text-sm text-white/50 mt-1">Keys are hashed with SHA-256. The full key is only shown once at creation.</p>
        </div>
        <button 
          onClick={generateApiKey}
          className="bg-white text-black px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2"
        >
          <Key className="h-4 w-4" />
          Generate New Key
        </button>
      </div>

      {/* ONE-TIME KEY REVEAL BANNER */}
      {newlyCreatedKey && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" />
            Copy your key now — it will never be shown again.
          </div>
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg px-4 py-3">
            <code className="flex-1 text-sm text-amber-300 font-mono tracking-wide break-all select-all">
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey)}
              className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={dismissNewKey}
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            I have saved my key — dismiss this message
          </button>
        </div>
      )}
      
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 text-sm">
            <Key className="h-6 w-6 mx-auto mb-3 opacity-30" />
            No API keys generated yet. Click above to create one.
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-5 flex items-center gap-4">
                <div className="h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
                  <Key className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-white text-sm block">{key.name}</span>
                  <code className="text-xs text-neutral-500 font-mono mt-0.5 block">
                    {key.key_hint || 'aether_sk_••••••••••••••••••••••••'}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-500">
                    {key.created_at ? new Date(key.created_at).toLocaleDateString() : 'Just now'}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    key.is_active 
                      ? 'text-neutral-300 bg-neutral-900 border-neutral-700' 
                      : 'text-red-400 bg-red-400/10 border-red-400/20'
                  }`}>
                    {key.is_active ? 'Active' : 'Revoked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-600">
        Keys are stored as SHA-256 hashes. Even our team cannot read your keys. If you lose a key, revoke it and generate a new one.
      </p>
    </div>
  );
}
