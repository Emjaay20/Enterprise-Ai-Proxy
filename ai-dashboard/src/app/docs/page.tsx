import Link from 'next/link';

export const metadata = {
  title: 'Documentation - Aether Control',
  description: 'Learn how to integrate the Enterprise AI Gateway, manage API keys, and leverage Semantic Caching.',
};

export default function DocsPage() {
  return (
    <main className="px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        
        {/* Navigation Sidebar */}
        <aside className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.7),rgba(9,13,19,0.95))] p-4 lg:sticky lg:top-24 lg:h-fit">
          <nav className="space-y-6">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Getting Started</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#introduction" className="text-cyan-300">Introduction</a></li>
                <li><a href="#quickstart" className="text-white/60 transition hover:text-white">Quickstart</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">Core Concepts</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#semantic-caching" className="text-white/60 transition hover:text-white">Semantic Caching</a></li>
                <li><a href="#telemetry" className="text-white/60 transition hover:text-white">Real-Time Telemetry</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">API Reference</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="#chat-completions" className="text-white/60 transition hover:text-white">/v1/chat/completions</a></li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Documentation Content */}
        <section className="rounded-md border border-white/10 bg-[linear-gradient(145deg,rgba(18,23,31,0.7),rgba(9,13,19,0.95))] p-6 md:p-8">
          <div className="text-sm text-white/45">
            <span>Docs</span>
            <span className="mx-2">›</span>
            <span>Gateway Engine</span>
          </div>

          <header className="mt-3 border-b border-white/10 pb-8">
            <h1 className="text-5xl font-semibold tracking-tight text-white">Aether Gateway</h1>
            <p className="mt-4 max-w-3xl text-xl leading-8 text-white/60">
              The ultimate Edge AI proxy. Route LLM requests, cache semantic variations instantly using local vector engines, and monitor every token flowing through your infrastructure.
            </p>
          </header>

          <section id="introduction" className="pt-8">
            <h2 className="text-3xl font-semibold text-white">Introduction</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/60">
              Aether Control acts as a middleman between your application and upstream LLM providers (like Groq, OpenAI, or Anthropic). Instead of your app talking directly to the LLM, you point your app to our Gateway endpoint. We handle the authentication, prompt vectorization, semantic caching, and telemetry logging seamlessly.
            </p>
          </section>

          <section id="quickstart" className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-3xl font-semibold text-white">Quickstart</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/60">
              To begin sending traffic through the gateway, you need to generate an organization API key and point your OpenAI-compatible client to the Aether endpoint.
            </p>
            
            <ol className="mt-6 space-y-4 text-white/70 list-decimal list-inside text-lg">
              <li>Log in to your <strong>Dashboard</strong>.</li>
              <li>Navigate to the <strong>API Keys</strong> section.</li>
              <li>Generate a new secure key.</li>
            </ol>

            <div className="mt-6 rounded-md border border-white/10 bg-[#0a111a] p-5 relative">
              <div className="mb-4 flex items-center justify-between text-xs text-white/35">
                <span className="uppercase tracking-[0.18em]">cURL</span>
              </div>
              <pre className="overflow-x-auto text-sm leading-7 text-cyan-300/95 font-mono">{`curl -X POST http://localhost:4000/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_AETHER_API_KEY" \\
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [
      { "role": "user", "content": "Explain semantic caching in one sentence." }
    ]
  }'`}</pre>
            </div>
          </section>

          <section id="semantic-caching" className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-3xl font-semibold text-white">Semantic Caching Engine</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/60">
              Aether Control doesn't just cache exact string matches. It uses a local embedding model (<code>Xenova/all-MiniLM-L6-v2</code>) to convert your incoming prompts into high-dimensional vectors on the fly. 
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/60">
              These vectors are compared against past queries in our Supabase `pgvector` database. If a prompt is semantically similar (over 95% match), we return the cached response instantly, reducing your LLM bill to zero and cutting latency by 90%.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-md border border-amber-400/20 bg-amber-400/5 p-5">
                <h3 className="text-xl font-medium text-amber-300">Cache Miss</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  The prompt has never been seen before. The gateway generates a vector, forwards the request to Groq, returns the LLM response to you, and saves the result to the Semantic Cache.
                </p>
              </article>

              <article className="rounded-md border border-emerald-400/20 bg-emerald-400/5 p-5">
                <h3 className="text-xl font-medium text-emerald-300">Cache Hit</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  A user asks the same question (even phrased slightly differently). The gateway detects the high vector similarity and instantly returns the cached response. No upstream API call is made.
                </p>
              </article>
            </div>
          </section>

          <section id="chat-completions" className="mt-10 border-t border-white/10 pt-8">
            <h2 className="text-3xl font-semibold text-white">API Reference: /v1/chat/completions</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-white/60">
              The Aether gateway is 100% compatible with the standard OpenAI API specification.
            </p>

            <div className="mt-5 overflow-hidden rounded-md border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-white/[0.04] text-[11px] uppercase tracking-[0.2em] text-white/40">
                  <tr>
                    <th className="px-4 py-3 font-medium">Header</th>
                    <th className="px-4 py-3 font-medium">Requirement</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  <tr>
                    <td className="px-4 py-4 text-white/75 font-mono">Authorization</td>
                    <td className="px-4 py-4 text-amber-300">Required</td>
                    <td className="px-4 py-4 text-white/55">Must be <code>Bearer &lt;YOUR_API_KEY&gt;</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 text-white/75 font-mono">Content-Type</td>
                    <td className="px-4 py-4 text-emerald-300">Required</td>
                    <td className="px-4 py-4 text-white/55">Must be <code>application/json</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-8 text-sm text-white/45">
              Ready to test it out? Head over to the{' '}
              <Link href="/" className="text-cyan-300 hover:text-cyan-200">
                Public Demo Playground
              </Link>{' '}
              to see Semantic Caching in action.
            </p>
          </section>

        </section>
      </div>
    </main>
  );
}
