'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

interface Article {
  id: string;
  title: string;
  category?: string;
  status: string;
  tags: string[];
}

export default function KnowledgePage() {
  const { data } = useQuery({
    queryKey: ['knowledge'],
    queryFn: async () => (await api.get('/knowledge?limit=50')).data.items as Article[],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Knowledge Base</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {(data ?? []).map((a) => (
          <div key={a.id} className="card p-5">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen size={18} className="text-brand-500" />
              <span className="font-medium">{a.title}</span>
            </div>
            <div className="text-xs text-slate-500">
              {a.category ?? 'Uncategorized'} · {a.status}
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="text-sm text-slate-500">No articles yet.</p>}
      </div>
    </div>
  );
}
