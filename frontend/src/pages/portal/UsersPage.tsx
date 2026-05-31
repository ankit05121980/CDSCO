import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { ROLE_LABEL } from '../../lib/roles';
import { formatDateTime } from '../../lib/format';

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="User Management" subtitle="All internal and external DDRS users with role-based access" />
      <DataTable
        endpoint="/users"
        searchPlaceholder="Search by name, email, office…"
        columns={[
          { key: 'fullName', label: 'Name', render: (r: any) => <span className="font-medium text-ink">{r.fullName}</span> },
          { key: 'email', label: 'Email' },
          { key: 'primaryRole', label: 'Role', render: (r: any) => ROLE_LABEL[r.primaryRole] || r.primaryRole },
          { key: 'office', label: 'Office / State', render: (r: any) => r.office || r.stateCode || '—' },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
          { key: 'lastLoginAt', label: 'Last Login', render: (r: any) => formatDateTime(r.lastLoginAt) },
        ]}
      />
    </div>
  );
}
