'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

interface Doc {
  id: string;
  title: string;
  status: string;
  tags: string[];
  indexed: boolean;
  currentVersion: number;
}

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => (await api.get('/documents?limit=50')).data.items as Doc[],
  });

  const create = useMutation({
    mutationFn: async () => api.post('/documents', { title, content }),
    onSuccess: () => {
      setOpen(false);
      setTitle('');
      setContent('');
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  async function summarize() {
    if (!content.trim()) return;
    const res = await api.post('/ai/summarize', { content });
    setSummary(res.data.summary);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <button className="btn-primary" onClick={() => setOpen((o) => !o)}>
          <Plus size={16} /> New document
        </button>
      </div>

      {open && (
        <div className="card space-y-3 p-5">
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label">Content (auto-indexed for RAG)</label>
            <textarea
              className="input min-h-[140px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {summary && (
            <div className="rounded-lg bg-brand-600/10 p-3 text-sm">
              <b>AI summary:</b> {summary}
            </div>
          )}
          <div className="flex gap-2">
            <button className="btn-primary" onClick={() => create.mutate()} disabled={!title}>
              Save
            </button>
            <button className="btn-ghost" onClick={summarize} disabled={!content}>
              <Sparkles size={16} /> Summarize
            </button>
          </div>
        </div>
      )}

      <div className="card divide-y divide-slate-200 dark:divide-slate-800">
        {(data ?? []).map((d) => (
          <div key={d.id} className="flex items-center gap-4 p-4">
            <FileText size={18} className="text-brand-500" />
            <div className="flex-1">
              <div className="font-medium">{d.title}</div>
              <div className="text-xs text-slate-500">
                v{d.currentVersion} · {d.status} · {d.indexed ? 'indexed' : 'not indexed'}
              </div>
            </div>
            <div className="flex gap-1">
              {d.tags?.map((t) => (
                <span key={t} className="rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && <p className="p-4 text-sm text-slate-500">No documents yet.</p>}
      </div>
    </div>
  );
}
