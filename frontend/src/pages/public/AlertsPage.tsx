import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, titleCase } from '../../lib/format';
import { AlertTriangle } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-red-600">
          <AlertTriangle size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-navy">Drug & Cosmetic Alerts</h1>
          <p className="text-slate-600">Not of Standard Quality (NSQ), spurious, adulterated and misbranded product alerts.</p>
        </div>
      </div>
      <DataTable
        endpoint="/public/alerts"
        searchPlaceholder="Search by product, brand, batch, manufacturer…"
        columns={[
          { key: 'referenceNo', label: 'Alert Ref', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'productName', label: 'Product' },
          { key: 'brandName', label: 'Brand' },
          { key: 'batchNo', label: 'Batch' },
          { key: 'manufacturerName', label: 'Manufacturer' },
          { key: 'classification', label: 'Classification', render: (r: any) => <StatusBadge status={r.classification} /> },
          { key: 'detectedDate', label: 'Detected', render: (r: any) => formatDate(r.detectedDate) },
        ]}
      />
    </div>
  );
}
