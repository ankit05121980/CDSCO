'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, ScanSearch } from 'lucide-react';
import { api } from '@/lib/api';

interface Risk {
  id: string;
  title: string;
  likelihood: number;
  impact: number;
  score: number;
  status: string;
}

function scoreColor(score: number) {
  if (score >= 15) return 'bg-red-500/15 text-red-400';
  if (score >= 8) return 'bg-amber-500/15 text-amber-400';
  return 'bg-emerald-500/15 text-emerald-400';
}

export default function GovernancePage() {
  const [text, setText] = useState('');
  const [assessment, setAssessment] = useState<any>(null);

  const risks = useQuery({
    queryKey: ['risks'],
    queryFn: async () => (await api.get('/risks?limit=50')).data.items as Risk[],
  });

  async function runCompliance() {
    if (!text.trim()) return;
    const res = await api.post('/ai/compliance', { content: text });
    setAssessment(res.data.assessment);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Risk & Compliance</h1>

      <div className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <ShieldAlert size={18} /> Risk register
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2">Risk</th>
              <th>Likelihood</th>
              <th>Impact</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(risks.data ?? []).map((r) => (
              <tr key={r.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="py-2 font-medium">{r.title}</td>
                <td>{r.likelihood}</td>
                <td>{r.impact}</td>
                <td>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${scoreColor(r.score)}`}>{r.score}</span>
                </td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ScanSearch size={18} /> AI compliance gap analysis
        </h2>
        <textarea
          className="input min-h-[120px]"
          placeholder="Paste a policy or control description to assess gaps…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary w-fit" onClick={runCompliance} disabled={!text}>
          Assess
        </button>
        {assessment && (
          <div className="rounded-lg bg-slate-100 p-3 text-sm dark:bg-slate-800">
            <p>
              Satisfied {assessment.satisfied}/{assessment.assessed} controls.
            </p>
            {assessment.gaps?.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-red-400">
                {assessment.gaps.map((g: any) => (
                  <li key={g.control}>
                    {g.control} — {g.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
