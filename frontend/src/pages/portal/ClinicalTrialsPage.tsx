import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, titleCase } from '../../lib/format';

const TYPES = ['', 'CLINICAL_TRIAL', 'GCT', 'BA_BE', 'PMS', 'ACADEMIC', 'FIELD_VET'];

export default function ClinicalTrialsPage() {
  const [type, setType] = useState('');
  return (
    <div>
      <PageHeader title="Clinical Trials" subtitle="CT, Global CT, BA/BE, PMS, academic & veterinary field trials with CTRI & ethics-committee linkage" />
      <DataTable
        endpoint="/clinical-trials"
        params={{ type: type || undefined }}
        searchPlaceholder="Search by reference, title, sponsor, CTRI…"
        detail={{ fetchUrl: (r) => `/clinical-trials/${r.id}` }}
        create={{
          title: 'New Clinical Trial Application',
          fields: [
            { name: 'title', label: 'Study Title', required: true },
            { name: 'type', label: 'Type', type: 'select', options: TYPES.filter(Boolean), half: true },
            { name: 'phase', label: 'Phase', type: 'select', options: ['I', 'II', 'III', 'IV'], half: true },
            { name: 'sponsorName', label: 'Sponsor', half: true },
            { name: 'drugName', label: 'Investigational Drug', half: true },
            { name: 'therapeuticArea', label: 'Therapeutic Area', half: true },
            { name: 'subjectsPlanned', label: 'Subjects Planned', type: 'number', half: true },
          ],
        }}
        toolbar={
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t ? titleCase(t) : 'All types'}</option>)}
          </select>
        }
        columns={[
          { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'title', label: 'Study' },
          { key: 'type', label: 'Type', render: (r: any) => <>{titleCase(r.type)}{r.isGlobal && <span className="ml-1 badge bg-blue-100 text-blue-800">Global</span>}</> },
          { key: 'phase', label: 'Phase', render: (r: any) => r.phase ? `Phase ${r.phase}` : '—' },
          { key: 'sitesCount', label: 'Sites' },
          { key: 'startDate', label: 'Start', render: (r: any) => formatDate(r.startDate) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
