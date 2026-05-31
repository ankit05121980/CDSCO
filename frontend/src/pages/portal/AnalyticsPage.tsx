import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import { api } from '../../lib/api';
import { ChartCard, DonutChart, BarChartH } from '../../components/ui/Charts';
import { titleCase } from '../../lib/format';
import { Download } from 'lucide-react';

const ENTITIES: Record<string, string[]> = {
  applications: ['status', 'type', 'jurisdiction', 'productCategory', 'priority', 'stateCode'],
  inspections: ['status', 'type', 'outcome', 'stateCode'],
  enforcement: ['classification', 'status', 'type', 'severity', 'stateCode'],
  licenses: ['status', 'licenceType', 'jurisdiction', 'productCategory'],
  products: ['category', 'status', 'schedule'],
  adverse_events: ['type', 'seriousness', 'causality', 'status', 'source'],
  payments: ['status', 'mode', 'gateway'],
  grievances: ['status', 'category', 'channel', 'priority'],
};

export default function AnalyticsPage() {
  const [entity, setEntity] = useState('applications');
  const [groupBy, setGroupBy] = useState('status');

  const { data } = useQuery({
    queryKey: ['report', entity, groupBy],
    queryFn: async () => (await api.get('/analytics/report', { params: { entity, groupBy } })).data,
  });

  const rows = data?.rows || [];

  const exportCsv = () => {
    const header = `${titleCase(groupBy)},Count\n`;
    const body = rows.map((r: any) => `"${r.name}",${r.value}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ddrs-${entity}-by-${groupBy}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Analytics & MIS" subtitle="Custom reporting and dynamic dashboards across the regulatory ecosystem" />

      <div className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="label">Dataset</label>
          <select className="select" value={entity} onChange={(e) => { setEntity(e.target.value); setGroupBy(ENTITIES[e.target.value][0]); }}>
            {Object.keys(ENTITIES).map((k) => <option key={k} value={k}>{titleCase(k)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Group By</label>
          <select className="select" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            {ENTITIES[entity].map((f) => <option key={f} value={f}>{titleCase(f)}</option>)}
          </select>
        </div>
        <button className="btn-outline" onClick={exportCsv}><Download size={16} /> Export CSV</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={`${titleCase(entity)} by ${titleCase(groupBy)}`}>
          <DonutChart data={rows} />
        </ChartCard>
        <ChartCard title="Distribution">
          <BarChartH data={rows} />
        </ChartCard>
      </div>

      <div className="card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">{titleCase(groupBy)}</th>
              <th className="px-4 py-3">Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.name} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium text-ink">{titleCase(String(r.name))}</td>
                <td className="px-4 py-3">{Number(r.value).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
