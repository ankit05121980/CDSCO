import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, CreditCard, Send } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { ROLE_GROUP } from '../../lib/roles';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDateTime, formatINR, titleCase } from '../../lib/format';

const NEXT: Record<string, { to: string; label: string }[]> = {
  PRE_SCREENING: [
    { to: 'UNDER_REVIEW', label: 'Accept & Review' },
    { to: 'QUERY_RAISED', label: 'Raise Query' },
    { to: 'REJECTED', label: 'Reject' },
  ],
  UNDER_REVIEW: [
    { to: 'INSPECTION', label: 'Send for Inspection' },
    { to: 'RECOMMENDED', label: 'Recommend' },
    { to: 'QUERY_RAISED', label: 'Raise Query' },
    { to: 'REJECTED', label: 'Reject' },
  ],
  QUERY_RAISED: [{ to: 'UNDER_REVIEW', label: 'Resume Review' }],
  INSPECTION: [
    { to: 'RECOMMENDED', label: 'Recommend' },
    { to: 'REJECTED', label: 'Reject' },
  ],
  RECOMMENDED: [
    { to: 'APPROVED', label: 'Approve & Issue' },
    { to: 'REJECTED', label: 'Reject' },
  ],
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isIndustry = ROLE_GROUP[user?.primaryRole || ''] === 'INDUSTRY';
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: app, refetch } = useQuery({
    queryKey: ['application', id],
    queryFn: async () => (await api.get(`/applications/${id}`)).data,
  });

  const act = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      await refetch();
      qc.invalidateQueries({ queryKey: ['application', id] });
    } finally {
      setBusy(false);
    }
  };

  if (!app) return <div className="text-slate-500">Loading…</div>;

  return (
    <div>
      <button onClick={() => navigate('/app/applications')} className="mb-4 flex items-center gap-1 text-sm text-navy hover:underline">
        <ArrowLeft size={16} /> Back to Applications
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-navy">{app.title}</h1>
          <div className="mt-1 font-mono text-sm text-slate-500">{app.referenceNo}</div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-ink">Application Details</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Type" value={titleCase(app.type)} />
              <Detail label="Product Category" value={titleCase(app.productCategory)} />
              <Detail label="Jurisdiction" value={titleCase(app.jurisdiction)} />
              <Detail label="Risk Class" value={app.riskClass ? `Class ${app.riskClass}` : '—'} />
              <Detail label="Applicant Entity" value={app.organizationName || '—'} />
              <Detail label="Current Stage" value={app.currentStage} />
              <Detail label="Assigned Officer" value={app.assignedToName ? '🔒 Masked (assigned)' : '—'} />
              <Detail label="Fee" value={formatINR(app.feeAmount)} />
              <Detail label="Submitted" value={formatDateTime(app.submittedAt)} />
              <Detail label="Due Date" value={formatDateTime(app.dueDate)} />
            </dl>
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="mb-4 font-semibold text-ink">Workflow Timeline</h3>
            <ol className="relative ml-3 border-l-2 border-slate-100">
              {(app.history || []).map((e: any) => (
                <li key={e.id} className="mb-5 ml-5">
                  <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-white bg-navy" />
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{titleCase(e.action)}</span>
                    {e.toStatus && <StatusBadge status={e.toStatus} />}
                  </div>
                  <div className="text-xs text-slate-400">{formatDateTime(e.createdAt)} · {e.actorName || 'System'}</div>
                  {e.remarks && <div className="mt-0.5 text-sm text-slate-600">{e.remarks}</div>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {isIndustry && app.status === 'DRAFT' && (
            <ActionCard title="Submit Application">
              <p className="mb-3 text-sm text-slate-500">Submit this application and proceed to fee payment.</p>
              <button className="btn-primary w-full" disabled={busy} onClick={() => act(() => api.post(`/applications/${id}/submit`))}>
                <Send size={16} /> Submit
              </button>
            </ActionCard>
          )}
          {isIndustry && app.status === 'SUBMITTED' && (
            <ActionCard title="Pay Fee">
              <p className="mb-3 text-sm text-slate-500">Pay {formatINR(app.feeAmount)} via Bharat Kosh / Treasury to proceed.</p>
              <button className="btn-saffron w-full" disabled={busy} onClick={() => act(() => api.post(`/applications/${id}/confirm-payment`))}>
                <CreditCard size={16} /> Pay {formatINR(app.feeAmount)}
              </button>
            </ActionCard>
          )}

          {!isIndustry && NEXT[app.status] && (
            <ActionCard title="Officer Actions">
              <textarea className="input mb-3" rows={2} placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <div className="space-y-2">
                {NEXT[app.status].map((n) => (
                  <button
                    key={n.to}
                    disabled={busy}
                    onClick={() => act(() => api.post(`/applications/${id}/transition`, { to: n.to, remarks }))}
                    className={`w-full ${n.to === 'REJECTED' ? 'btn-outline text-red-600 border-red-200 hover:bg-red-50' : n.to === 'APPROVED' ? 'btn-saffron' : 'btn-primary'}`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </ActionCard>
          )}

          {(app.status === 'ISSUED' || app.issuedLicenseId) && (
            <div className="card border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 size={18} /> <span className="font-semibold">Outcome Issued</span>
              </div>
              <p className="mt-2 text-sm text-green-700">
                Licence/Certificate has been issued and is publicly verifiable via QR.
              </p>
              <button className="btn-outline mt-3 w-full" onClick={() => navigate('/app/licenses')}>
                View in Licences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}

function ActionCard({ title, children }: { title: string; children: any }) {
  return (
    <div className="card p-5">
      <h3 className="mb-3 font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}
