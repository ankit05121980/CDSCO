import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, formatINR, titleCase } from '../../lib/format';

const TYPES = ['', 'PRODUCTION', 'SALES', 'CONSUMPTION', 'STOCK'];

export default function ReturnsPage() {
  const [type, setType] = useState('');
  return (
    <div>
      <PageHeader title="Returns Filing" subtitle="Periodic production / sales / consumption / stock returns (GST/ITR-style data capture)" />
      <DataTable
        endpoint="/returns"
        params={{ type: type || undefined }}
        searchPlaceholder="Search by reference, entity, period…"
        create={{
          title: 'File a Return',
          fields: [
            { name: 'organizationName', label: 'Entity', required: true },
            { name: 'type', label: 'Return Type', type: 'select', options: ['PRODUCTION', 'SALES', 'CONSUMPTION', 'STOCK'], half: true },
            { name: 'period', label: 'Period (e.g. Q1-2026)', required: true, half: true },
            { name: 'totalValue', label: 'Total Value (₹)', type: 'number' },
          ],
        }}
        toolbar={
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t ? titleCase(t) : 'All types'}</option>)}
          </select>
        }
        columns={[
          { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'organizationName', label: 'Entity' },
          { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
          { key: 'period', label: 'Period' },
          { key: 'totalValue', label: 'Value', render: (r: any) => formatINR(r.totalValue) },
          { key: 'filedDate', label: 'Filed', render: (r: any) => formatDate(r.filedDate) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
