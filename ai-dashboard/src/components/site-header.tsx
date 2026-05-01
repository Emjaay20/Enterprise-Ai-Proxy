"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, UserCircle2 } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/playground', label: 'Playground' },
  { href: '/docs', label: 'Docs' },
  { href: '#settings', label: 'Settings' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b12]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center px-4 md:px-6">
        <Link
          href="/"
          className="mr-4 inline-flex min-w-[146px] items-center border-r border-white/10 pr-4 text-lg font-semibold uppercase tracking-tight text-white md:mr-6 md:min-w-[160px]"
        >
          Aether Control
        </Link>

        <label className="relative hidden w-full max-w-xs lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            placeholder="Search clusters..."
            className="h-10 w-full rounded-[2px] border border-white/10 bg-white/[0.02] pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/55"
          />
        </label>

        <nav className="ml-2 hidden items-center gap-1 lg:ml-6 lg:flex">
          {navItems.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-5 py-5 text-sm transition ${
                  active ? 'text-cyan-300' : 'text-white/65 hover:text-white'
                }`}
              >
                {item.label}
                {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-300" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button
            aria-label="Notifications"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/10 bg-white/[0.02] text-white/75 transition hover:text-white"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            aria-label="Account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[2px] border border-white/10 bg-white/[0.02] text-white/75 transition hover:text-white"
          >
            <UserCircle2 className="h-4 w-4" />
          </button>
          <button className="ml-1 h-10 rounded-[2px] border border-cyan-100/30 bg-cyan-100 px-4 text-sm font-medium text-slate-900 transition hover:bg-white">
            Connect Cluster
          </button>
        </div>
      </div>
    </header>
  );
}
