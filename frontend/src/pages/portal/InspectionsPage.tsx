import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, titleCase } from '../../lib/format';

const TYPES = ['', 'MANUFACTURING', 'JOINT', 'BA_BE', 'CRO', 'BLOOD_CENTRE', 'RETAIL', 'WC', 'MEDICAL_DEVICE'];

export default function InspectionsPage() {
  const [type, setType] = useState('');
  return (
    <div>
      <PageHeader title="Inspections" subtitle="Risk-based & joint (Centre–State) inspections with geo-tagging, masked assignment and digital forms (Form-35 / MD-11 / COS-11)" />
      <DataTable
        endpoint="/inspections"
        params={{ type: type || undefined }}
        searchPlaceholder="Search by reference, entity…"
        toolbar={
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t ? titleCase(t) : 'All types'}</option>)}
          </select>
        }
        columns={[
          { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'type', label: 'Type', render: (r: any) => <>{titleCase(r.type)}{r.isJoint && <span className="ml-1 badge bg-blue-100 text-blue-800">Joint</span>}</> },
          { key: 'entityName', label: 'Entity' },
          { key: 'formType', label: 'Form', render: (r: any) => r.formType?.replace('_', '-') },
          { key: 'scheduledDate', label: 'Scheduled', render: (r: any) => formatDate(r.scheduledDate) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'outcome', label: 'Outcome', render: (r: any) => r.outcome ? <StatusBadge status={r.outcome} /> : '—' },
        ]}
      />
    </div>
  );
}
