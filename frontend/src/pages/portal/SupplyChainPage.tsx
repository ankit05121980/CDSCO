import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { api } from '../../lib/api';
import { formatDate, formatINR, titleCase } from '../../lib/format';
import { Search, ArrowRight } from 'lucide-react';

function TraceTool() {
  const [batchNo, setBatchNo] = useState('');
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState('');
  const trace = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    setData(null);
    try {
      const res = await api.get(`/supply-chain/trace/${encodeURIComponent(batchNo.trim())}`);
      setData(res.data);
    } catch {
      setErr('Batch not found. Try a batch number from the Batches tab.');
    }
  };
  return (
    <div className="card p-5">
      <form onSubmit={trace} className="flex gap-2">
        <input className="input" placeholder="Enter batch number (e.g. AB12345)" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
        <button className="btn-primary whitespace-nowrap"><Search size={16} /> Trace</button>
      </form>
      {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
      {data && (
        <div className="mt-5">
          <div className="mb-4 rounded-lg bg-navy-50 p-4">
            <div className="font-semibold text-navy">{data.batch.productName} ({data.batch.brandName})</div>
            <div className="text-sm text-slate-600">Batch {data.batch.batchNo} · Mfg {formatDate(data.batch.manufactureDate)} · Exp {formatDate(data.batch.expiryDate)} · {titleCase(data.batch.storageCondition)}</div>
            <div className="mt-1"><StatusBadge status={data.batch.status} /></div>
          </div>
          <ol className="relative ml-3 border-l-2 border-slate-100">
            {data.movements.map((m: any, i: number) => (
              <li key={i} className="mb-5 ml-5">
                <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white bg-saffron" />
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  {m.fromType} <ArrowRight size={14} /> {m.toType}
                </div>
                <div className="text-xs text-slate-500">{m.fromEntity} → {m.toEntity}</div>
                <div className="text-xs text-slate-400">{formatDate(m.movementDate)} · Qty {m.quantity?.toLocaleString('en-IN')} · {m.invoiceNo}</div>
              </li>
            ))}
            {data.movements.length === 0 && <li className="ml-5 text-sm text-slate-400">No movements recorded yet.</li>}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function SupplyChainPage() {
  return (
    <div>
      <PageHeader title="Supply Chain Track & Trace" subtitle="Batch-level QR traceability from sourcing to consumption, with invoices and cold-chain monitoring" />
      <Tabs
        tabs={[
          { id: 'trace', label: 'Track & Trace', content: <TraceTool /> },
          {
            id: 'batches',
            label: 'Batches',
            content: (
              <DataTable
                endpoint="/supply-chain/batches"
                searchPlaceholder="Search by batch, product, manufacturer…"
                columns={[
                  { key: 'batchNo', label: 'Batch', render: (r: any) => <span className="font-mono text-xs text-navy">{r.batchNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'brandName', label: 'Brand' },
                  { key: 'manufacturerName', label: 'Manufacturer' },
                  { key: 'storageCondition', label: 'Storage', render: (r: any) => titleCase(r.storageCondition) },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'invoices',
            label: 'Invoices',
            content: (
              <DataTable
                endpoint="/supply-chain/invoices"
                searchPlaceholder="Search by invoice, seller, buyer…"
                columns={[
                  { key: 'invoiceNo', label: 'Invoice', render: (r: any) => <span className="font-mono text-xs text-navy">{r.invoiceNo}</span> },
                  { key: 'sellerName', label: 'Seller' },
                  { key: 'buyerName', label: 'Buyer' },
                  { key: 'invoiceDate', label: 'Date', render: (r: any) => formatDate(r.invoiceDate) },
                  { key: 'amount', label: 'Amount', render: (r: any) => formatINR(Math.round(r.amount)) },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
