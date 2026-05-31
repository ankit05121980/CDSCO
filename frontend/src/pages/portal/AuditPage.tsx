import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { formatDateTime } from '../../lib/format';

export default function AuditPage() {
  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Immutable log of all actions — user, timestamp, IP and outcome (ISO 27001 aligned)" />
      <DataTable
        endpoint="/audit"
        searchPlaceholder="Search by action, user, IP…"
        columns={[
          { key: 'createdAt', label: 'Timestamp', render: (r: any) => formatDateTime(r.createdAt) },
          { key: 'userEmail', label: 'User', render: (r: any) => r.userEmail || 'anonymous' },
          { key: 'userRole', label: 'Role' },
          { key: 'action', label: 'Action', render: (r: any) => <span className="font-mono text-xs">{r.action}</span> },
          { key: 'statusCode', label: 'Status' },
          { key: 'ip', label: 'IP' },
          { key: 'durationMs', label: 'Duration', render: (r: any) => `${r.durationMs ?? 0} ms` },
        ]}
      />
    </div>
  );
}
