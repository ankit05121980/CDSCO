import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import Modal from '../../components/ui/Modal';
import { api } from '../../lib/api';
import { formatDateTime } from '../../lib/format';
import { Plug, Zap, CheckCircle2, XCircle } from 'lucide-react';

export default function IntegrationsPage() {
  const [selected, setSelected] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const { data: catalog } = useQuery({ queryKey: ['int-catalog'], queryFn: async () => (await api.get('/integrations/catalog')).data });
  const { data: stats } = useQuery({ queryKey: ['int-stats'], queryFn: async () => (await api.get('/integrations/stats')).data });

  const invoke = async (sys: any) => {
    setSelected(sys);
    setResult(null);
    setBusy(true);
    try {
      const res = await api.post('/integrations/invoke', { system: sys.key, payload: { value: 'DEMO-REF-' + Math.floor(Math.random() * 99999), operation: 'verify' } });
      setResult(res.data);
    } catch (e: any) {
      setResult({ status: 'FAILED', response: { error: e?.message } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Integrations Hub" subtitle="API-based integrations with 35 government & external systems (simulated adapters in this build)" />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Connected Systems" value={stats?.systems ?? 35} icon={Plug} tone="navy" />
        <StatCard label="Total Calls" value={stats?.totalCalls ?? '—'} icon={Zap} tone="saffron" />
        <StatCard label="Successful" value={stats?.success ?? '—'} icon={CheckCircle2} tone="green" />
        <StatCard label="Failed" value={stats?.failed ?? '—'} icon={XCircle} tone="red" />
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(catalog || []).map((sys: any) => (
          <div key={sys.key} className="card flex items-center justify-between p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink">{sys.name}</span>
                <span className="badge bg-slate-100 text-slate-600">P{sys.priority}</span>
              </div>
              <div className="truncate text-xs text-slate-500">{sys.purpose}</div>
              <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{sys.direction}</div>
            </div>
            <button className="btn-outline shrink-0" onClick={() => invoke(sys)}>
              <Zap size={14} /> Test
            </button>
          </div>
        ))}
      </div>

      <h3 className="mb-3 font-semibold text-navy">Recent Integration Logs</h3>
      <DataTable
        endpoint="/integrations/logs"
        searchPlaceholder="Search by system, operation…"
        columns={[
          { key: 'createdAt', label: 'Time', render: (r: any) => formatDateTime(r.createdAt) },
          { key: 'systemName', label: 'System' },
          { key: 'direction', label: 'Direction' },
          { key: 'operation', label: 'Operation' },
          { key: 'latencyMs', label: 'Latency', render: (r: any) => `${r.latencyMs} ms` },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Test: ${selected?.name || ''}`} size="lg">
        {busy && <div className="text-slate-500">Invoking adapter…</div>}
        {result && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <StatusBadge status={result.status} />
              {result.latencyMs != null && <span className="text-sm text-slate-500">{result.latencyMs} ms</span>}
            </div>
            <div className="text-xs font-semibold uppercase text-slate-400">Response</div>
            <pre className="mt-1 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-green-300">
{JSON.stringify(result.response, null, 2)}
            </pre>
            <p className="mt-3 text-xs text-slate-400">Simulated response for demonstration. Production wires real APIs.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
