"use client";

import { useState, type FormEvent } from 'react';
import { Play, Zap, Clock, CheckCircle2, Circle, Copy, Trash2, ChevronDown } from 'lucide-react';

const MODEL_OPTIONS = [
  { label: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
  { label: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile' },
  { label: 'Mixtral 8x7B 32K', value: 'mixtral-8x7b-32768' }
] as const;

export default function Playground() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<{ latency?: number; cached?: boolean }>({});
  const [selectedModel, setSelectedModel] = useState<string>(MODEL_OPTIONS[0].value);
  const [systemContext, setSystemContext] = useState('You are a helpful AI assistant.');
  const [expectedTask, setExpectedTask] = useState('gateway flow test');

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse('');
    setMetrics({});
    const startTime = performance.now();

    try {
      // Call the server-side proxy to avoid CORS and hide service keys.
      const res = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'external_user_01',
          model: selectedModel,
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: prompt }
          ],
          eval_context: {
            environment: 'production',
            expected_task: expectedTask
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const details = typeof data?.details === 'string' ? data.details : 'Request failed at gateway.';
        throw new Error(details);
      }

      const latency = Math.round(performance.now() - startTime);

      setResponse(data?.choices?.[0]?.message?.content || JSON.stringify(data));
      setMetrics({ latency, cached: !!data?.cached });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown gateway error.';
      setResponse(`Gateway request failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const runbook = [
    { label: 'Open dashboard', done: true },
    { label: 'Repeat same prompt', done: false },
    { label: 'Observe cached path', done: false },
  ];

  return (
    <main className="px-4 py-6 md:px-6 md:py-8">
      <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto w-full max-w-[1200px]">
        <section className="border-b border-white/10 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-white">AI Lab Environment</h1>
              <p className="mt-3 text-xl text-white/60">Workspace for testing gateway, cache, and eval flows.</p>
            </div>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[2px] border border-cyan-200/40 bg-cyan-300 px-6 text-sm font-medium text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-4 w-4" />
              {loading ? 'Executing...' : 'Execute Task'}
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.42fr_1fr]">
          <article className="grid min-h-[520px] rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(14,18,25,0.78),rgba(9,13,19,0.95))] md:grid-cols-[1.7fr_1fr]">
            <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  <span>✦</span>
                  Prompt Composer
                </h2>
                <span className="text-xs text-white/40">{prompt.length} chars</span>
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="h-[360px] w-full resize-none rounded-[2px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/85 outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
              />

              <p className="mt-4 text-sm leading-6 text-white/35">
                e.g., Analyze the following system logs and identify any potential security breaches. Provide a summary of the anomalies detected.
              </p>

              <div className="mt-4 flex items-center gap-2 text-xs text-white/40">
                <span className="rounded-[2px] border border-white/10 bg-white/[0.03] px-2 py-1">Proxy</span>
                <span className="rounded-[2px] border border-white/10 bg-white/[0.03] px-2 py-1">Cache-aware</span>
                <span className="rounded-[2px] border border-white/10 bg-white/[0.03] px-2 py-1">Latency tracked</span>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Runbook Steps</h3>
                <div className="flex items-center gap-2 text-white/45">
                  <Copy className="h-3.5 w-3.5" />
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="space-y-3">
                {runbook.map((step) => (
                  <div key={step.label} className="flex items-center gap-2.5 text-lg text-white/85">
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    ) : (
                      <Circle className="h-4 w-4 text-white/45" />
                    )}
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(14,18,25,0.78),rgba(9,13,19,0.95))] p-5">
              <h2 className="mb-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                <span>⚙</span>
                Control & Settings
              </h2>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50">Model Selection</span>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="h-10 w-full appearance-none rounded-[2px] border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none transition focus:border-cyan-400/50"
                  >
                    {MODEL_OPTIONS.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50">System Query / Context</span>
                <textarea
                  value={systemContext}
                  onChange={(e) => setSystemContext(e.target.value)}
                  className="h-[96px] w-full resize-none rounded-[2px] border border-white/10 bg-white/[0.03] p-3 text-sm text-white/85 outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                  placeholder="You are a helpful AI assistant."
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/50">Expected Task Tag</span>
                <input
                  type="text"
                  value={expectedTask}
                  onChange={(e) => setExpectedTask(e.target.value)}
                  className="h-10 w-full rounded-[2px] border border-white/10 bg-white/[0.03] px-3 text-sm text-white/85 outline-none transition placeholder:text-white/30 focus:border-cyan-400/50"
                  placeholder="gateway flow test"
                />
              </label>
            </article>

            <article className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(14,18,25,0.78),rgba(9,13,19,0.95))] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  <span>▣</span>
                  Gateway Output
                </h2>
                {metrics.latency ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-xs font-medium ${metrics.cached ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/20 bg-amber-400/10 text-amber-300'}`}>
                    {metrics.cached ? <Zap className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {metrics.cached ? 'Cache hit' : 'Cache miss'}
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-white/30" />
                )}
              </div>

              <div className="min-h-[210px] rounded-[2px] border border-white/10 border-dashed bg-black/20 p-4">
                {loading ? (
                  <div className="animate-pulse text-center text-sm text-white/40">Routing through gateway...</div>
                ) : response ? (
                  <div className="space-y-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/85">{response}</p>
                    {metrics.latency ? (
                      <div className={`inline-flex items-center gap-2 rounded-[2px] border px-2.5 py-1.5 text-xs font-semibold ${metrics.cached ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-amber-400/20 bg-amber-400/10 text-amber-300'}`}>
                        {metrics.cached ? <Zap className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                        {metrics.cached ? 'CACHE HIT' : 'CACHE MISS'}
                        <span>•</span>
                        {metrics.latency}ms
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center text-center text-sm leading-7 text-white/55">
                    Enter a prompt and execute it to preview the end-to-end gateway flow.
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      </form>
    </main>
  );
}
