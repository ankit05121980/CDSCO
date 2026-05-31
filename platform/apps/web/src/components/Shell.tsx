'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  Search,
  ShieldAlert,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/search', label: 'AI Search', icon: Search },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/governance', label: 'Risk & Compliance', icon: ShieldAlert },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Sparkles size={18} />
          </div>
          <span className="text-lg font-semibold">Athena</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  active
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <Icon size={18} /> {label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="btn-ghost mt-4 w-full justify-start">
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Enterprise AI Digital Transformation Platform
          </h2>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <div className="font-medium text-slate-700 dark:text-slate-200">{user?.email ?? '…'}</div>
            <div>{user?.roles?.join(', ')}</div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
