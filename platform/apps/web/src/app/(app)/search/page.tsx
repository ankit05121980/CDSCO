'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';

interface Match {
  sourceType: string;
  sourceId: string;
  chunkIndex: number;
  content: string;
  finalScore: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/ai/rag/search', { query, topK: 8 });
      setMatches(res.data.matches);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">AI-Powered Search</h1>
      <form onSubmit={run} className="flex gap-2">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Semantic + keyword hybrid search across your corpus…"
        />
        <button className="btn-primary" disabled={loading}>
          <Search size={16} /> Search
        </button>
      </form>

      {loading && <p className="text-sm text-slate-400">Searching…</p>}
      {!loading && searched && matches.length === 0 && (
        <p className="text-sm text-slate-500">No results. Try ingesting documents first.</p>
      )}
      <div className="space-y-3">
        {matches.map((m, i) => (
          <div key={i} className="card p-4">
            <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium uppercase">{m.sourceType}</span>
              <span>score {m.finalScore.toFixed(3)}</span>
            </div>
            <p className="text-sm">{m.content.slice(0, 280)}…</p>
          </div>
        ))}
      </div>
    </div>
  );
}
