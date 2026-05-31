import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { titleCase } from '../../lib/format';

const TYPES = [
  '', 'MANUFACTURER', 'IMPORTER', 'EXPORTER', 'WHOLESALER', 'RETAILER',
  'CRO', 'ETHICS_COMMITTEE', 'BLOOD_CENTRE', 'BA_BE_CENTRE', 'CONSULTANT', 'MARKETER',
];

export default function EntitiesPage() {
  const [type, setType] = useState('');
  return (
    <div>
      <PageHeader
        title="Regulated Entity Registry"
        subtitle="Manufacturers, importers, exporters, distributors, CROs, ethics committees, blood centres and more"
      />
      <DataTable
        endpoint="/registry/organizations"
        params={{ type: type || undefined }}
        searchPlaceholder="Search by name, registration no, GSTIN…"
        create={{
          title: 'Register New Entity',
          fields: [
            { name: 'name', label: 'Entity Name', required: true },
            { name: 'type', label: 'Type', type: 'select', options: TYPES.filter(Boolean), half: true },
            { name: 'registrationNo', label: 'Registration No', required: true, half: true },
            { name: 'gstin', label: 'GSTIN', half: true },
            { name: 'pan', label: 'PAN', half: true },
            { name: 'stateName', label: 'State', half: true },
            { name: 'city', label: 'City', half: true },
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
          { key: 'name', label: 'Entity', render: (r: any) => <span className="font-medium text-ink">{r.name}</span> },
          { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
          { key: 'registrationNo', label: 'Reg. No', render: (r: any) => <span className="font-mono text-xs">{r.registrationNo}</span> },
          { key: 'stateName', label: 'State' },
          { key: 'city', label: 'City' },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
