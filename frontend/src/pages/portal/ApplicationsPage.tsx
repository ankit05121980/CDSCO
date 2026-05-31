import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { ROLE_GROUP } from '../../lib/roles';
import { formatDate, formatINR, titleCase } from '../../lib/format';

const TYPES = [
  'MARKET_AUTHORISATION', 'MANUFACTURING_LICENCE', 'IMPORT_LICENCE', 'IMPORT_REGISTRATION',
  'SALE_LICENCE', 'TEST_LICENCE', 'LOAN_LICENCE', 'RENEWAL', 'ENDORSEMENT',
  'POST_APPROVAL_CHANGE', 'SUSPENSION', 'SURRENDER_CANCELLATION', 'WITHDRAWAL',
  'CORRECTION', 'APPEAL', 'NOC',
];
const STATUSES = [
  'DRAFT', 'SUBMITTED', 'PRE_SCREENING', 'UNDER_REVIEW', 'QUERY_RAISED',
  'INSPECTION', 'RECOMMENDED', 'APPROVED', 'ISSUED', 'REJECTED',
];
const CATEGORIES = ['DRUG', 'BIOLOGICAL', 'MEDICAL_DEVICE', 'IVD', 'COSMETIC', 'VETERINARY'];

export default function ApplicationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isIndustry = ROLE_GROUP[user?.primaryRole || ''] === 'INDUSTRY';
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ type: 'MANUFACTURING_LICENCE', productCategory: 'DRUG', riskClass: 'C', jurisdiction: 'CENTRE', title: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const res = await api.post('/applications', form);
      setShowNew(false);
      navigate(`/app/applications/${res.data.id}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Registration, licensing, renewals, endorsements, post-approval changes, NOCs and appeals"
        actions={
          isIndustry ? (
            <button className="btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={16} /> New Application
            </button>
          ) : null
        }
      />

      <DataTable
        endpoint="/applications"
        params={{ type: type || undefined, status: status || undefined, applicantUserId: isIndustry ? user?.id : undefined }}
        searchPlaceholder="Search by reference, title, entity…"
        onRowClick={(r: any) => navigate(`/app/applications/${r.id}`)}
        toolbar={
          <>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">All types</option>
              {TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}
            </select>
          </>
        }
        columns={[
          { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
          { key: 'organizationName', label: 'Applicant Entity' },
          { key: 'feeAmount', label: 'Fee', render: (r: any) => formatINR(r.feeAmount) },
          { key: 'submittedAt', label: 'Submitted', render: (r: any) => formatDate(r.submittedAt) },
          { key: 'dueDate', label: 'Due', render: (r: any) => formatDate(r.dueDate) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Application">
        <div className="space-y-4">
          <div>
            <label className="label">Application Type</label>
            <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Product Category</label>
              <select className="select" value={form.productCategory} onChange={(e) => setForm({ ...form, productCategory: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Risk Class</label>
              <select className="select" value={form.riskClass} onChange={(e) => setForm({ ...form, riskClass: e.target.value })}>
                {['A', 'B', 'C', 'D'].map((c) => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Jurisdiction</label>
            <select className="select" value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}>
              <option value="CENTRE">Central (CDSCO)</option>
              <option value="STATE">State Licensing Authority</option>
            </select>
          </div>
          <div>
            <label className="label">Title / Description</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Manufacturing licence for Paracetamol 500mg" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button className="btn-outline" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={saving}>{saving ? 'Creating…' : 'Create Draft'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
