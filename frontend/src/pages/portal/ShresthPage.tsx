import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { ChartCard, BarChartH } from '../../components/ui/Charts';
import { Trophy } from 'lucide-react';

const GRADE: Record<string, string> = {
  'A+': 'bg-green-100 text-green-800', A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-800', C: 'bg-amber-100 text-amber-800', D: 'bg-red-100 text-red-800',
};

export default function ShresthPage() {
  const { data } = useQuery({ queryKey: ['shresth'], queryFn: async () => (await api.get('/analytics/shresth')).data });
  const rows = data || [];
  const chart = rows.slice(0, 12).map((r: any) => ({ name: r.stateName, value: r.score }));

  return (
    <div>
      <PageHeader title="SHRESTH Index" subtitle="State Regulatory Performance Benchmarking — composite score across licensing, inspections, surveillance, grievance & disposal" />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Top 12 States by SHRESTH Score">
          <BarChartH data={chart} color="#138808" />
        </ChartCard>
        <div className="card p-5">
          <div className="flex items-center gap-2 text-navy">
            <Trophy className="text-saffron" /> <h3 className="font-semibold">Methodology</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• Inspection completion (25%)</li>
            <li>• Application disposal rate (25%)</li>
            <li>• Grievance resolution rate (25%)</li>
            <li>• Quality surveillance / NSQ detection (25%)</li>
          </ul>
          <p className="mt-3 text-xs text-slate-400">Scores normalised to 0–100 and graded A+ to D. Computed in real time from live regulatory data.</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">State / UT</th>
                <th className="px-4 py-3">Inspections</th>
                <th className="px-4 py-3">NSQ Detected</th>
                <th className="px-4 py-3">Grievance Res.</th>
                <th className="px-4 py-3">Disposal</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.stateCode} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-bold text-navy">#{r.rank}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.stateName}</td>
                  <td className="px-4 py-3">{r.inspectionsCompleted}</td>
                  <td className="px-4 py-3">{r.nsqDetected}</td>
                  <td className="px-4 py-3">{r.grievanceResolutionRate}%</td>
                  <td className="px-4 py-3">{r.applicationDisposalRate}%</td>
                  <td className="px-4 py-3 font-semibold">{r.score}</td>
                  <td className="px-4 py-3"><span className={`badge ${GRADE[r.grade]}`}>{r.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
