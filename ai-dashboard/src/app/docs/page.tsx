import Link from 'next/link';

export const metadata = {
  title: 'Docs - Aether Control',
  description: 'Quickstart, architecture, and operational guidance for Aether Control.',
};

export default function DocsPage() {
  return (
    <main className="px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.7),rgba(9,13,19,0.95))] p-4 lg:sticky lg:top-24 lg:h-fit">
          <nav className="space-y-6">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Getting Started</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#quickstart" className="text-cyan-300">Quickstart</a>
                </li>
                <li>
                  <a href="#installation" className="text-white/60 transition hover:text-white">Installation</a>
                </li>
                <li>
                  <a href="#configuration" className="text-white/60 transition hover:text-white">Configuration</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Core Concepts</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#architecture" className="text-white/60 transition hover:text-white">Architecture</a>
                </li>
                <li>
                  <a href="#data-models" className="text-white/60 transition hover:text-white">Data Models</a>
                </li>
                <li>
                  <a href="#security" className="text-white/60 transition hover:text-white">Security</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">API Reference</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#rest" className="text-white/60 transition hover:text-white">REST API</a>
                </li>
                <li>
                  <a href="#graphql" className="text-white/60 transition hover:text-white">GraphQL</a>
                </li>
                <li>
                  <a href="#webhooks" className="text-white/60 transition hover:text-white">Webhooks</a>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <section className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.7),rgba(9,13,19,0.95))] p-6 md:p-8">
          <div className="text-sm text-white/45">
            <span>Docs</span>
            <span className="mx-2">›</span>
            <span>Getting Started</span>
          </div>

          <header className="mt-3 border-b border-white/10 pb-8">
            <h1 className="text-5xl font-semibold tracking-tight text-white">Quickstart Guide</h1>
            <p className="mt-4 max-w-3xl text-xl leading-8 text-white/60">
              Get up and running with Aether Control in minutes. This guide covers the essential steps to deploy your first cluster and establish basic telemetry.
            </p>
          </header>

          <section id="quickstart" className="pt-8">
            <h2 className="text-4xl font-semibold text-white">1. Initialization</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">
              Begin by authenticating your CLI instance against the primary Obsidian Flux endpoint. Ensure you have your access tokens configured in your local environment.
            </p>

            <div className="mt-6 rounded-md border border-white/10 bg-[#0a111a] p-5">
              <div className="mb-4 flex items-center justify-between text-xs text-white/35">
                <span className="uppercase tracking-[0.18em]">bash</span>
                <span className="rounded-[2px] border border-white/10 px-2 py-1">copy</span>
              </div>
              <pre className="overflow-x-auto text-sm leading-7 text-cyan-300/95">{`$ aether auth login --token=$AETHER_API_KEY
> Authentication... [OK]
> Connection established to cluster-alpha-9.

$ aether cluster init --region us-east --tier standard
> Provisioning resources...
> Region: us-east
> Status: READY
> Endpoint: https://api.aether.flux/c/alpha-9`}</pre>
            </div>
          </section>

          <section id="architecture" className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-4xl font-semibold text-white">Architecture Overview</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-white/60">
              Aether Control utilizes a decoupled, event-driven architecture to ensure throughput and minimal latency across global regions.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-md border border-white/10 bg-white/[0.02] p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-cyan-300/25 bg-cyan-300/8 text-cyan-300">
                  ✣
                </div>
                <h3 className="mt-4 text-3xl font-medium text-white">Ingestion Layer</h3>
                <p className="mt-3 text-base leading-7 text-white/55">
                  Stateless edge nodes handle high-volume telemetry ingestion, immediately persisting raw data to distributed message queues before processing.
                </p>
              </article>

              <article className="rounded-md border border-white/10 bg-white/[0.02] p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] border border-emerald-300/25 bg-emerald-300/8 text-emerald-300">
                  ◫
                </div>
                <h3 className="mt-4 text-3xl font-medium text-white">Storage Fabric</h3>
                <p className="mt-3 text-base leading-7 text-white/55">
                  Time-series data is routed to highly optimized columnar stores, ensuring sub-millisecond query performance for complex analytical workloads.
                </p>
              </article>
            </div>
          </section>

          <section id="security" className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-4xl font-semibold text-white">Operational Notes</h2>
            <div className="mt-5 overflow-hidden rounded-md border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-white/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Parameter</th>
                    <th className="px-4 py-3 font-medium">Threshold</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  <tr>
                    <td className="px-4 py-4 text-white/75">Ingest.Latency</td>
                    <td className="px-4 py-4 text-amber-300">&gt; 50ms</td>
                    <td className="px-4 py-4 text-white/55">Scale ingestion workers horizontally. Check network pathing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white/75">Storage.IOPS</td>
                    <td className="px-4 py-4 text-emerald-300">&gt; 80% Cap</td>
                    <td className="px-4 py-4 text-white/55">Monitor query complexity. Consider pre-aggregating common views.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white/75">Auth.Failures</td>
                    <td className="px-4 py-4 text-amber-300">&gt; 5/min</td>
                    <td className="px-4 py-4 text-white/55">Review audit logs for credential stuffing. Enable IP rate limiting.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm text-white/45">
              Explore real request traces and test prompts in the{' '}
              <Link href="/playground" className="text-cyan-300 hover:text-cyan-200">
                Playground
              </Link>
              .
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
