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

        {/* METRICS BENTO BOX */}
        <section className="mt-32 grid md:grid-cols-3 gap-6">
          <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col justify-between h-64">
            <Database className="h-6 w-6 text-neutral-400" />
            <div>
              <p className="text-4xl font-medium text-white tracking-tight mb-2">&lt; 15ms</p>
              <p className="text-sm text-neutral-500">Average vector cache hit latency globally.</p>
            </div>
          </div>
          <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col justify-between h-64">
            <Shield className="h-6 w-6 text-neutral-400" />
            <div>
              <p className="text-4xl font-medium text-white tracking-tight mb-2">100%</p>
              <p className="text-sm text-neutral-500">SOC2 Type II compliant logging & telemetry.</p>
            </div>
          </div>
          <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col justify-between h-64">
            <Activity className="h-6 w-6 text-neutral-400" />
            <div>
              <p className="text-4xl font-medium text-white tracking-tight mb-2">99.99%</p>
              <p className="text-sm text-neutral-500">Uptime SLA backed by multi-region redundancy.</p>
            </div>
          </div>
        </section>

        {/* DEMO SECTION */}
        <section className="mt-32">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-white">Interact with the Edge.</h2>
            <p className="mt-4 text-neutral-400 text-lg">
              Test our semantic vector engine directly. Send a prompt, view the upstream latency, and send it again to see the sub-20ms cache hit interception.
            </p>
          </div>
          
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/50 overflow-hidden shadow-2xl">
            <div className="border-b border-neutral-800 bg-neutral-900/50 p-4 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-neutral-400" />
              <span className="text-xs font-mono text-neutral-400">~/aether/live-demo</span>
            </div>
            
            <div className="p-6 md:p-10">
              <PublicPlayground />
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
