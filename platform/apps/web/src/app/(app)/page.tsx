'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText, BookOpen, ShieldAlert, FolderKanban, Bot, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';

function useTotal(resource: string) {
  return useQuery({
    queryKey: ['total', resource],
    queryFn: async () => {
      const res = await api.get(`/${resource}?limit=1`);
      return res.data.total as number;
    },
  });
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/10 text-brand-500">
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const docs = useTotal('documents');
  const knowledge = useTotal('knowledge');
  const risks = useTotal('risks');
  const projects = useTotal('projects');
  const agents = useQuery({
    queryKey: ['agents'],
    queryFn: async () => (await api.get('/ai/agents')).data as { name: string; description: string }[],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Executive Dashboard</h1>
        <p className="text-sm text-slate-500">Unified view across your enterprise knowledge & governance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={docs.data ?? '—'} icon={FileText} />
        <StatCard label="Knowledge articles" value={knowledge.data ?? '—'} icon={BookOpen} />
        <StatCard label="Open risks" value={risks.data ?? '—'} icon={ShieldAlert} />
        <StatCard label="Projects" value={projects.data ?? '—'} icon={FolderKanban} />
      </div>

      <div className="card p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Bot size={18} /> AI Agents
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(agents.data ?? []).map((a) => (
            <div key={a.name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="font-medium capitalize">{a.name} agent</div>
              <div className="text-sm text-slate-500">{a.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
