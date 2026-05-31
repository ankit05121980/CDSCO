import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { titleCase } from '../../lib/format';

const TYPES = ['', 'CENTRAL', 'STATE', 'PRIVATE'];

export default function LaboratoriesPage() {
  const [type, setType] = useState('');
  return (
    <div>
      <PageHeader
        title="Testing Laboratory Registry"
        subtitle="Central, State and Private (NABL-accredited) testing laboratories — onboardable without code changes"
      />
      <DataTable
        endpoint="/registry/laboratories"
        params={{ type: type || undefined }}
        searchPlaceholder="Search by name, registration no, NABL no…"
        create={{
          title: 'Onboard New Laboratory',
          fields: [
            { name: 'name', label: 'Laboratory Name', required: true },
            { name: 'type', label: 'Type', type: 'select', options: ['CENTRAL', 'STATE', 'PRIVATE'], half: true },
            { name: 'registrationNo', label: 'Registration No', required: true, half: true },
            { name: 'stateName', label: 'State', half: true },
            { name: 'city', label: 'City', half: true },
            { name: 'nablAccreditationNo', label: 'NABL Accreditation No', half: true },
            { name: 'contactPerson', label: 'Contact Person', half: true },
            { name: 'email', label: 'Email', half: true },
            { name: 'phone', label: 'Phone', half: true },
          ],
        }}
        toolbar={
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => (
              <option key={t} value={t}>{t ? titleCase(t) : 'All types'}</option>
            ))}
          </select>
        }
        columns={[
          { key: 'name', label: 'Laboratory', render: (r: any) => <span className="font-medium text-ink">{r.name}</span> },
          { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
          { key: 'stateName', label: 'State' },
          { key: 'nablAccredited', label: 'NABL', render: (r: any) => (r.nablAccredited ? <span className="badge bg-green-100 text-green-800">Accredited</span> : <span className="text-slate-400">—</span>) },
          { key: 'capacityPerMonth', label: 'Capacity/mo' },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
