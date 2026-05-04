import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Console Dashboard', href: '/dashboard' },
      { label: 'Login', href: '/login' },
    ],
  },
  {
    title: 'Developer',
    links: [
      { label: 'Portfolio', href: 'https://yusuf-saka-portfolio.vercel.app/', external: true },
      { label: 'GitHub', href: 'https://github.com/Emjaay20', external: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/yusuf-saka/', external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-neutral-800 bg-black text-neutral-400">
      <div className="mx-auto flex flex-col md:flex-row w-full max-w-[1200px] justify-between gap-12 px-6 py-16">

        <div className="flex flex-col">
          <div className="text-lg font-bold uppercase tracking-tight text-white mb-4">
            Aether Control
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-500">
            Enterprise AI Proxy and Semantic Caching layer. Built for modern LLM infrastructure.
          </p>
          <p className="mt-8 text-xs text-neutral-600">
            © {new Date().getFullYear()} Yusuf Saka. All rights reserved.
          </p>
        </div>

        <div className="flex gap-16 sm:gap-24">
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-400 hover:text-white transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </footer>
  );
}
