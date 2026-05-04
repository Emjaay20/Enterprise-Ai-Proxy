import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowRight, Terminal, Activity, Database, Shield, Zap } from 'lucide-react';
import { PublicPlayground } from '../components/public-playground';
import { TelemetryTable } from '../components/telemetry-table';

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
  created_at: string;
}

export default async function LandingPage() {
  const { data, error } = await supabase
    .from('telemetry_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const logs = (data as TelemetryLog[]) ?? [];

  return (
    <main className="min-h-screen bg-black text-[#ededed] font-sans selection:bg-white selection:text-black">
      
      {/* BACKGROUND MESH - Very subtle, no glowing orbs */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="fixed inset-0 z-0 bg-black [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-32 pb-24">
        
        {/* HERO SECTION - Stark, high-contrast, left-aligned or centered without gradients */}
        <section className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 text-neutral-300 text-xs font-medium tracking-wide">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            Aether Engine v1.2 is now generally available
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-white leading-[1.1]">
            Semantic routing <br className="hidden md:block"/>
            <span className="text-neutral-500">for modern LLMs.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-neutral-400 font-light tracking-tight max-w-2xl mx-auto">
            A drop-in proxy that cuts OpenAI and Anthropic costs by up to 90% using edge-deployed vector caching and intelligent load balancing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href="/login" className="h-12 px-8 rounded-md bg-white text-black font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2">
              Start Building <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/docs" className="h-12 px-8 rounded-md bg-transparent border border-neutral-800 text-neutral-300 font-medium hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2">
              Read Documentation
            </Link>
          </div>
        </section>

        {/* CONVERSION SECTION: stacked — copy + metrics on top, playground full-width below */}
        <section className="mt-32 flex flex-col gap-12">

          {/* TOP ROW: Explanation left, Metrics right */}
          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">

            {/* Copy + Steps + Hit/Miss */}
            <div className="flex flex-col gap-8">

            {/* Step-by-step conversion copy */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Live Demo — Try it yourself</p>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white leading-tight">
                See the cache engine work in real time.
              </h2>
              <p className="mt-4 text-neutral-400 leading-relaxed">
                Send any prompt below. Your request hits our Gateway, gets vectorized, and is checked against the semantic cache. On a <strong className="text-white font-medium">first request</strong>, you'll see a raw LLM round-trip. On a <strong className="text-white font-medium">second request</strong>, our engine intercepts it in milliseconds.
              </p>
            </div>

            {/* Step instructions */}
            <ol className="space-y-5">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 text-xs font-semibold text-neutral-300">1</span>
                <div>
                  <p className="text-sm font-medium text-white">Type any prompt and hit Send Request.</p>
                  <p className="text-sm text-neutral-500 mt-0.5">The request is forwarded live to our Gateway running on Groq infrastructure.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 text-xs font-semibold text-neutral-300">2</span>
                <div>
                  <p className="text-sm font-medium text-white">Watch the Telemetry Table below.</p>
                  <p className="text-sm text-neutral-500 mt-0.5">Your request logs instantly — latency, token count, and cache status all update in real time.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 text-xs font-semibold text-neutral-300">3</span>
                <div>
                  <p className="text-sm font-medium text-white">Send the same (or a similar) prompt again.</p>
                  <p className="text-sm text-neutral-500 mt-0.5">The vector engine detects the semantic match and returns the answer instantly — zero LLM call, zero cost.</p>
                </div>
              </li>
            </ol>

            {/* Cache Hit / Miss explainer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-500"></span>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Cache Miss</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Prompt is new. Gateway embeds it, queries Groq, stores the result. Latency: <span className="text-neutral-300">500–2000ms</span>.
                </p>
              </div>
              <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-white"></span>
                  <span className="text-xs font-semibold text-white uppercase tracking-widest">Cache Hit</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Semantically matched. Cached response returned instantly. Latency: <span className="text-white">under 20ms</span>.
                </p>
              </div>
            </div>

            </div>

            {/* Metrics stacked vertically on the right */}
            <div className="flex flex-col gap-3 pt-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600 mb-2">Platform Stats</p>
              <div className="flex items-center justify-between px-5 py-4 rounded-lg border border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-3">
                  <Database className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-400">Avg. cache hit latency</span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">&lt; 15ms</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 rounded-lg border border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-400">Compliance logging</span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">SOC2 Type II</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4 rounded-lg border border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-neutral-500" />
                  <span className="text-sm text-neutral-400">Platform uptime SLA</span>
                </div>
                <span className="text-lg font-semibold text-white tracking-tight">99.99%</span>
              </div>
            </div>

          </div>

          {/* BOTTOM: Live Playground — full width */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 bg-neutral-900/50 p-4 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-mono text-neutral-400">~/aether/live-demo</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-neutral-700"></span>
                <span className="h-2 w-2 rounded-full bg-neutral-700"></span>
                <span className="h-2 w-2 rounded-full bg-neutral-600"></span>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <PublicPlayground />
            </div>
            <div className="border-t border-neutral-800 bg-neutral-900/30 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-neutral-600">Convinced? Get your own API key in 30 seconds.</p>
              <Link href="/login" className="text-xs font-medium text-white hover:text-neutral-300 transition-colors flex items-center gap-1">
                Sign up free <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

        </section>

        {/* TELEMETRY SECTION */}
        <section className="mt-32">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">Live Global Telemetry.</h2>
            <p className="mt-4 text-neutral-400 text-lg">
              A transparent view into the platform. Every request is recorded, tokenized, and measured.
            </p>
          </div>
          
          <div className="w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/50">
            <TelemetryTable logs={logs} />
          </div>
        </section>

      </div>
    </main>
  );
}
