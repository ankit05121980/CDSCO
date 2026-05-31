import { ReactNode, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Menu, LogOut, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { navForRole, ROLE_GROUP, ROLE_LABEL, PORTAL_NAME } from '../lib/roles';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const { data: unread } = useQuery({
    queryKey: ['unread'],
    queryFn: async () => (await api.get('/notifications/unread-count')).data,
    enabled: !!user,
    refetchInterval: 60000,
  });

  if (loading)
    return (
      <div className="grid h-screen place-items-center text-slate-500">Loading…</div>
    );
  if (!user) return <Navigate to="/login" replace />;

  const group = ROLE_GROUP[user.primaryRole] || 'INDUSTRY';
  const nav = navForRole(user.primaryRole);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside
        className={`${
          open ? 'w-64' : 'w-0'
        } hidden shrink-0 overflow-hidden bg-navy-900 text-slate-200 transition-all md:block`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-navy-800 px-4">
          <img src="/emblem.svg" alt="" className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-sm font-bold text-white">DDRS</div>
            <div className="text-[10px] text-slate-400">{PORTAL_NAME[group]}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5 overflow-y-auto p-2" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          {nav.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== '/app' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? 'bg-saffron text-white'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen((o) => !o)} className="rounded p-2 hover:bg-slate-100">
              <Menu size={20} />
            </button>
            <span className="text-sm font-semibold text-navy">{PORTAL_NAME[group]}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app/notifications" className="relative rounded-full p-2 hover:bg-slate-100">
              <Bell size={20} className="text-slate-600" />
              {unread?.unread > 0 && (
                <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-saffron px-1 text-[10px] font-bold text-white">
                  {unread.unread > 99 ? '99+' : unread.unread}
                </span>
              )}
            </Link>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
              <div className="hidden leading-tight sm:block">
                <div className="text-xs font-semibold text-ink">{user.fullName}</div>
                <div className="text-[10px] text-slate-500">{ROLE_LABEL[user.primaryRole]}</div>
              </div>
              <button onClick={logout} title="Logout" className="ml-1 text-slate-400 hover:text-red-600">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
