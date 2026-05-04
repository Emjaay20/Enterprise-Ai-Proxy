"use client";

import { useState } from 'react';
import { Play, Zap, Clock } from 'lucide-react';
import Link from 'next/link';

export function PublicPlayground() {
  const [prompt, setPrompt] = useState('Analyze this system error log: Database connection timeout on region EU-West-3');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [metrics, setMetrics] = useState<{ latency?: number; cached?: boolean }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    setMetrics({});
    const startTime = performance.now();

    try {
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'public_demo_user',
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          eval_context: { environment: 'demo', expected_task: 'landing_page_demo' }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.details || 'Request failed');

      const latency = Math.round(performance.now() - startTime);
      setResponse(data?.choices?.[0]?.message?.content || 'Success');
      setMetrics({ latency, cached: !!data?.cached });
    } catch (error) {
      setResponse(`Demo request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2 text-neutral-300">
      {/* Left: Input */}
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-3 block">
          Input Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 w-full min-h-[160px] resize-none rounded-md border border-neutral-800 bg-black p-4 text-sm text-neutral-300 outline-none transition focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 font-mono"
          placeholder="Type your prompt..."
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="mt-4 w-full h-11 bg-white hover:bg-neutral-200 text-black font-medium rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 fill-current" />
          {loading ? 'Routing...' : 'Send Request'}
        </button>
      </form>

      {/* Right: Output */}
      <div className="flex flex-col h-full border-t border-neutral-800 pt-8 md:border-t-0 md:pt-0 md:border-l md:pl-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
            Response
          </span>
          {metrics.latency ? (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              metrics.cached 
                ? 'bg-neutral-800 text-neutral-200 border border-neutral-700' 
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
            }`}>
              {metrics.cached ? <Zap className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {metrics.cached ? 'Cache hit' : 'Cache miss'} • {metrics.latency}ms
            </span>
          ) : null}
        </div>
        
        <div className="flex-1 rounded-md border border-neutral-800 bg-neutral-900/30 p-4 min-h-[160px] max-h-[300px] overflow-y-auto font-mono text-sm">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <span className="animate-pulse text-neutral-500">Processing request...</span>
            </div>
          ) : response ? (
            <p className="whitespace-pre-wrap leading-relaxed text-neutral-300">{response}</p>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-neutral-600">Hit send to test routing.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
