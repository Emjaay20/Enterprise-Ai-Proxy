import { createClient } from '@supabase/supabase-js';
import { TelemetryTable } from '../components/telemetry-table';
import type { ReactElement } from 'react';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

interface TelemetryLog {
  id: string;
  request_id: string;
  user_id: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  status: string;
  eval_context: { environment: string; expected_task: string } | null;
  timestamp: string;
}

function IconGauge({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 14a7 7 0 1114 0" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 14l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconChip({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h3M3 15h3M18 9h3M18 15h3M9 3v3M15 3v3M9 18v3M15 18v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function IconDiamond({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 4l7 5-7 11L5 9l7-5z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function formatCompact(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return `${value}`;
}

function MetricCard({
  title,
  value,
  suffix,
  hint,
  Icon,
  progress,
}: {
  title: string;
  value: string;
  suffix?: string;
  hint: string;
  Icon: ({ className }: { className?: string }) => ReactElement;
  progress?: number;
}) {
  return (
    <article className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(19,24,32,0.72),rgba(13,17,24,0.9))] p-5">
      <div className="flex items-center justify-between text-white/50">
        <h3 className="text-xs uppercase tracking-[0.22em]">{title}</h3>
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-6 flex items-end gap-2 text-white">
        <span className="text-3xl font-medium tracking-tight">{value}</span>
        {suffix ? <span className="pb-1 text-sm text-white/50">{suffix}</span> : null}
      </div>
      <p className="mt-2 text-sm text-cyan-300/90">{hint}</p>
      {typeof progress === 'number' ? (
        <div className="mt-4 h-1.5 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-cyan-300" style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }} />
        </div>
      ) : null}
    </article>
  );
}

function IntelligenceFlow({ logs }: { logs: TelemetryLog[] }) {
  const series = [...logs].slice(0, 10).reverse();
  const fallback = [45, 61, 40, 70, 55, 35, 65, 50, 72, 58];
  const values = series.length
    ? series.map((log) => {
        const tokens = log.prompt_tokens + log.completion_tokens;
        return Math.max(24, Math.min(96, Math.round((log.latency_ms / 450) * 80 + (tokens / 1200) * 20)));
      })
    : fallback;

  const peak = Math.max(...values);

  return (
    <section className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.8),rgba(10,14,21,0.95))] p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl text-white">Intelligence Flow</h2>
        <div className="inline-flex items-center gap-1 text-xs">
          <button className="rounded-[2px] border border-white/10 px-3 py-1.5 text-white/70">1H</button>
          <button className="rounded-[2px] border border-cyan-300/40 bg-cyan-300/15 px-3 py-1.5 text-cyan-300">24H</button>
          <button className="rounded-[2px] border border-white/10 px-3 py-1.5 text-white/70">7D</button>
        </div>
      </div>

      <div className="grid h-[270px] grid-cols-10 items-end gap-1.5 rounded-[2px] border border-white/5 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10%_100%] p-2 md:gap-2">
        {values.map((value, index) => (
          <div key={index} className="relative flex h-full items-end">
            <div
              className="w-full rounded-t-[2px] border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(52,211,153,0.26),rgba(34,211,238,0.34)_45%,rgba(34,211,238,0.14))]"
              style={{ height: `${value}%` }}
              title={`Point ${index + 1}: ${value} ops/s`}
            />
            {value === peak ? (
              <span className="absolute -top-5 right-0 rounded-[2px] border border-white/10 bg-[#1a2330] px-2 py-0.5 text-[10px] text-cyan-300">
                Peak: {value.toFixed(1)}k ops/s
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-xs text-white/40">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
      </div>
    </section>
  );
}

function StreamPanel({ logs }: { logs: TelemetryLog[] }) {
  const recent = [...logs].slice(0, 4);
  const items = recent.length
    ? recent.map((log, index) => {
        const tone = log.status === 'success' ? 'text-emerald-300' : 'text-amber-300';
        const badge = log.status === 'success' ? `+${Math.max(2, Math.round(log.latency_ms / 12))}ms` : 'Alert';
        const label = log.status === 'success' ? 'Active' : 'Review';

        return {
          id: log.id,
          title: log.eval_context?.expected_task || `Route Optimized ${index + 1}`,
          region: log.eval_context?.environment || 'Global Cluster',
          badge,
          tone,
          label,
        };
      })
    : [
        { id: 'a', title: 'Model Sync', region: 'Node_Alpha_7', badge: '+12ms', tone: 'text-emerald-300', label: 'Active' },
        { id: 'b', title: 'Cache Miss Drop', region: 'US-East-1a', badge: 'Alert', tone: 'text-amber-300', label: 'Review' },
        { id: 'c', title: 'Vector Re-index', region: 'Global Cluster', badge: 'Active', tone: 'text-emerald-300', label: 'Active' },
        { id: 'd', title: 'Route Optimized', region: 'EU-West-3', badge: '-45ms', tone: 'text-cyan-300', label: 'Active' },
      ];

  return (
    <aside className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.8),rgba(10,14,21,0.95))] p-4 md:p-5">
      <h2 className="text-2xl text-white">Telemetry Stream</h2>
      <div className="mt-4 space-y-2.5">
        {items.map((item) => (
          <article key={item.id} className="flex items-center justify-between rounded-[2px] border border-white/10 bg-white/[0.02] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/12 text-[10px] text-cyan-300">
                ◈
              </span>
              <div>
                <p className="text-lg leading-none text-white">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/40">{item.region}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm ${item.tone}`}>{item.badge}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-white/35">{item.label}</p>
            </div>
          </article>
        ))}
      </div>
      <button className="mt-4 w-full text-center text-xs font-medium uppercase tracking-[0.2em] text-cyan-300 transition hover:text-cyan-200">
        View Full Logs
      </button>
    </aside>
  );
}

export default async function Dashboard() {
  const { data, error } = await supabase
    .from('telemetry_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(120);

  if (error) {
    console.error('Error fetching logs:', error);
    return <div className="p-10 text-red-400">Failed to load telemetry data.</div>;
  }

  const logs = (data as TelemetryLog[]) ?? [];
  const sample = logs.slice(0, 40);
  const avgLatency = sample.length ? sample.reduce((sum, log) => sum + log.latency_ms, 0) / sample.length : 12.4;
  const successRate = sample.length
    ? (sample.filter((log) => log.status === 'success').length / sample.length) * 100
    : 98.2;
  const totalTokens = sample.reduce((sum, log) => sum + log.prompt_tokens + log.completion_tokens, 0);

  return (
    <main className="px-4 py-8 md:px-6">
      <div className="mx-auto w-full max-w-[1200px] space-y-7">
        <section className="rounded-md border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,20,0.8),rgba(8,12,18,0.92))] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-medium text-white">Live Telemetry</h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-white/60">
                Real-time performance metrics and intelligent load distribution across the Aether control plane.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-[2px] border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300" /> Cluster Optimal
              </span>
              <span className="rounded-[2px] border border-white/10 bg-white/[0.03] px-3 py-2 text-white/60">
                Uptime: 99.999%
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Latency Pressure"
            value={avgLatency.toFixed(1)}
            suffix="ms"
            hint="↘ -0.8ms vs last hr"
            Icon={IconGauge}
          />
          <MetricCard
            title="Cache Fit"
            value={successRate.toFixed(1)}
            suffix="%"
            hint="Semantic match stability"
            Icon={IconChip}
            progress={successRate}
          />
          <MetricCard
            title="Signal Quality"
            value="Tier 1"
            hint="All regions synchronized"
            Icon={IconDiamond}
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.8fr_0.92fr]">
          <IntelligenceFlow logs={logs} />
          <StreamPanel logs={logs} />
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-medium text-white">Execution Records</h2>
            <span className="text-sm text-white/40">{formatCompact(totalTokens)} tokens in current window</span>
          </div>
          <TelemetryTable logs={logs} />
        </section>
      </div>
    </main>
  );
}
