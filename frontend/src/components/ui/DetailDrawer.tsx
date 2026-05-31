import { useQuery } from '@tanstack/react-query';
import { X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import StatusBadge from './StatusBadge';
import { formatDateTime, titleCase } from '../../lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  record: any;
  /** Optional endpoint to fetch the full record (with sub-collections). */
  fetchUrl?: string;
}

const HIDE_KEYS = new Set(['id', 'qrPayload', 'passwordHash', 'updatedAt', 'ownerUserId', 'organizationId', 'applicantUserId', 'manufacturerId', 'productId', 'relatedLicenseId', 'issuedLicenseId', 'assignedToId', 'entityId', 'labId', 'sampleId', 'batchId', 'relatedAeId', 'trialId', 'paymentId']);
const STATUS_KEYS = new Set(['status', 'outcome', 'result', 'classification', 'causality', 'seriousness', 'type', 'priority']);
const DATE_HINT = /(date|at|from|to|hearing)$/i;

function isScalar(v: any) {
  return v === null || ['string', 'number', 'boolean'].includes(typeof v);
}

export default function DetailDrawer({ open, onClose, title, record, fetchUrl }: Props) {
  const { data, isFetching } = useQuery({
    queryKey: ['detail', fetchUrl],
    queryFn: async () => (await api.get(fetchUrl!)).data,
    enabled: open && !!fetchUrl,
  });
  if (!open || !record) return null;
  const full = data || record;

  const scalarEntries = Object.entries(full).filter(([k, v]) => isScalar(v) && !HIDE_KEYS.has(k) && v !== null && v !== '');
  const arrayEntries = Object.entries(full).filter(([, v]) => Array.isArray(v) && (v as any[]).length > 0);

  const heading = title || full.referenceNo || full.ticketNo || full.caseNo || full.name || full.fullName || full.batchNo || full.code || 'Details';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="truncate text-lg font-bold text-navy">{heading}</div>
            {full.title && full.title !== heading && <div className="truncate text-sm text-slate-500">{full.title}</div>}
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="p-5">
          {isFetching && <div className="mb-3 flex items-center gap-2 text-sm text-slate-400"><Loader2 size={14} className="animate-spin" /> Loading full record…</div>}

          <dl className="grid grid-cols-2 gap-4">
            {scalarEntries.map(([k, v]) => (
              <div key={k} className={k === 'description' || k === 'address' || k === 'conclusion' ? 'col-span-2' : ''}>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{titleCase(k)}</dt>
                <dd className="mt-0.5 break-words text-sm font-medium text-ink">{renderValue(k, v)}</dd>
              </div>
            ))}
          </dl>

          {arrayEntries.map(([k, v]) => (
            <div key={k} className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-navy">{titleCase(k)} ({(v as any[]).length})</h4>
              <div className="space-y-2">
                {(v as any[]).slice(0, 25).map((item, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm">
                    {isScalar(item) ? (
                      <span>{String(item)}</span>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(item).filter(([ik, iv]) => isScalar(iv) && !HIDE_KEYS.has(ik) && iv !== null && iv !== '').map(([ik, iv]) => (
                          <div key={ik}>
                            <span className="text-[10px] uppercase text-slate-400">{titleCase(ik)}: </span>
                            <span className="text-ink">{renderValue(ik, iv)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderValue(key: string, v: any) {
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (STATUS_KEYS.has(key) && typeof v === 'string') return <StatusBadge status={v} />;
  if (typeof v === 'string' && DATE_HINT.test(key) && /^\d{4}-\d\d-\d\d/.test(v)) return formatDateTime(v);
  if (typeof v === 'number' && /amount|value|fee|quantity|total/i.test(key)) return v.toLocaleString('en-IN');
  return String(v);
}
