import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate, titleCase } from '../../lib/format';

const STATUSES = ['', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'CLOSED'];

export default function GrievancesPage() {
  const [status, setStatus] = useState('');
  return (
    <div>
      <PageHeader title="Grievance Redressal" subtitle="Multi-channel complaint ticketing (Web / IVRS / Email / Chatbot) with SLA & escalation" />
      <DataTable
        endpoint="/grievances"
        params={{ status: status || undefined }}
        searchPlaceholder="Search by ticket, subject, complainant…"
        create={{
          title: 'Log Grievance',
          fields: [
            { name: 'category', label: 'Category', type: 'select', options: ['PRODUCT_QUALITY', 'COUNTERFEIT', 'SERVICE', 'LICENSING', 'OTHER'] },
            { name: 'subject', label: 'Subject', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'complainantName', label: 'Complainant', half: true },
            { name: 'priority', label: 'Priority', type: 'select', options: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], half: true },
          ],
        }}
        toolbar={
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s ? titleCase(s) : 'All statuses'}</option>)}
          </select>
        }
        columns={[
          { key: 'ticketNo', label: 'Ticket', render: (r: any) => <span className="font-mono text-xs text-navy">{r.ticketNo}</span> },
          { key: 'category', label: 'Category', render: (r: any) => titleCase(r.category) },
          { key: 'subject', label: 'Subject' },
          { key: 'channel', label: 'Channel' },
          { key: 'priority', label: 'Priority', render: (r: any) => titleCase(r.priority) },
          { key: 'dueDate', label: 'Due', render: (r: any) => formatDate(r.dueDate) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
