import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';

export default function TechnicalPersonsPage() {
  return (
    <div>
      <PageHeader
        title="Technical Person Registry"
        subtitle="Competent technical staff — uniquely engaged with a single entity (enforced by the platform)"
      />
      <DataTable
        endpoint="/registry/technical-persons"
        searchPlaceholder="Search by name, registration no, qualification…"
        create={{
          title: 'Register Technical Person',
          fields: [
            { name: 'name', label: 'Full Name', required: true, half: true },
            { name: 'registrationNo', label: 'Registration No', required: true, half: true },
            { name: 'qualification', label: 'Qualification', half: true },
            { name: 'designation', label: 'Designation', half: true },
            { name: 'email', label: 'Email', half: true },
            { name: 'phone', label: 'Phone', half: true },
            { name: 'experienceYears', label: 'Experience (years)', type: 'number', half: true },
          ],
        }}
        columns={[
          { key: 'name', label: 'Name', render: (r: any) => <span className="font-medium text-ink">{r.name}</span> },
          { key: 'registrationNo', label: 'Reg. No', render: (r: any) => <span className="font-mono text-xs">{r.registrationNo}</span> },
          { key: 'qualification', label: 'Qualification' },
          { key: 'organizationName', label: 'Engaged With', render: (r: any) => r.organizationName || <span className="text-slate-400">Available</span> },
          { key: 'experienceYears', label: 'Experience', render: (r: any) => `${r.experienceYears || 0} yrs` },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
