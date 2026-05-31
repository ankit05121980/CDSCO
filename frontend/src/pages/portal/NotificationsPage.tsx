import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime } from '../../lib/format';
import { api } from '../../lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function NotificationsPage() {
  const qc = useQueryClient();
  const markAll = async () => {
    await api.patch('/notifications/read-all');
    qc.invalidateQueries();
  };
  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Alerts, application status updates and reminders"
        actions={<button className="btn-outline" onClick={markAll}>Mark all read</button>}
      />
      <DataTable
        endpoint="/notifications"
        searchPlaceholder="Search notifications…"
        columns={[
          { key: 'type', label: 'Type', render: (r: any) => <StatusBadge status={r.type} /> },
          { key: 'title', label: 'Title', render: (r: any) => <span className={r.read ? 'text-slate-500' : 'font-semibold text-ink'}>{r.title}</span> },
          { key: 'message', label: 'Message' },
          { key: 'category', label: 'Category' },
          { key: 'createdAt', label: 'When', render: (r: any) => formatDateTime(r.createdAt) },
        ]}
      />
    </div>
  );
}
