import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, titleCase } from '../../lib/format';

export default function LicensesPage() {
  const [tab, setTab] = useState<'licenses' | 'certificates'>('licenses');
  return (
    <div>
      <PageHeader title="Licences & Certificates" subtitle="Issued licences, certificates (COPP/FSC/MSC/NCC/WC/GMP) and NOCs with QR verification" />

      <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm w-fit">
        <button onClick={() => setTab('licenses')} className={`rounded-md px-4 py-2 font-medium ${tab === 'licenses' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}>Licences</button>
        <button onClick={() => setTab('certificates')} className={`rounded-md px-4 py-2 font-medium ${tab === 'certificates' ? 'bg-white text-navy shadow-sm' : 'text-slate-500'}`}>Certificates & NOCs</button>
      </div>

      {tab === 'licenses' ? (
        <DataTable
          endpoint="/licenses"
          searchPlaceholder="Search by reference, holder, type…"
          columns={[
            { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
            { key: 'licenceType', label: 'Type', render: (r: any) => titleCase(r.licenceType) },
            { key: 'formNumber', label: 'Form' },
            { key: 'holderName', label: 'Holder' },
            { key: 'validTo', label: 'Valid To', render: (r: any) => formatDate(r.validTo) },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
        />
      ) : (
        <DataTable
          endpoint="/certificates"
          searchPlaceholder="Search by reference, holder…"
          columns={[
            { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
            { key: 'certType', label: 'Type', render: (r: any) => r.certType },
            { key: 'isNoc', label: 'Kind', render: (r: any) => (r.isNoc ? <span className="badge bg-blue-100 text-blue-800">NOC</span> : <span className="badge bg-slate-100 text-slate-700">Certificate</span>) },
            { key: 'holderName', label: 'Holder' },
            { key: 'validTo', label: 'Valid To', render: (r: any) => formatDate(r.validTo) },
            { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          ]}
        />
      )}
    </div>
  );
}
