import Link from 'next/link';

const footerColumns = [
  {
    title: 'API Documentation',
    links: [
      { label: 'SDK Reference', href: '/docs' },
      { label: 'Gateway Endpoints', href: '/docs' },
    ],
  },
  {
    title: 'Changelog',
    links: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Data Retention', href: '#retention' },
    ],
  },
  {
    title: 'Terms of Service',
    links: [
      { label: 'Security', href: '#security' },
      { label: 'Compliance', href: '#compliance' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-[#04070d]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 py-10 md:grid-cols-[1.3fr_1fr_1fr_1fr] md:px-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/35">Aether Control</div>
          <p className="mt-3 max-w-xs text-xs uppercase leading-6 tracking-[0.18em] text-white/25">
            © 2026 Obsidian Flux AI. All rights reserved.
          </p>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title} className="space-y-3">
            <h3 className="text-xs uppercase tracking-[0.2em] text-white/35">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs uppercase tracking-[0.16em] text-white/55 transition hover:text-cyan-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
