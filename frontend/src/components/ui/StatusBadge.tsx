import clsx from 'clsx';
import { titleCase } from '../../lib/format';

const MAP: Record<string, string> = {
  // positive
  APPROVED: 'bg-green-100 text-green-800',
  ISSUED: 'bg-green-100 text-green-800',
  RENEWED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PASS: 'bg-green-100 text-green-800',
  RESOLVED: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  PAID: 'bg-green-100 text-green-800',
  COMPLIANT: 'bg-green-100 text-green-800',
  // warning / in-progress
  PENDING: 'bg-amber-100 text-amber-800',
  UNDER_REVIEW: 'bg-amber-100 text-amber-800',
  PRE_SCREENING: 'bg-amber-100 text-amber-800',
  QUERY_RAISED: 'bg-orange-100 text-orange-800',
  INSPECTION: 'bg-blue-100 text-blue-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  RECOMMENDED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  OPEN: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-slate-100 text-slate-700',
  // negative
  REJECTED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
  FAIL: 'bg-red-100 text-red-800',
  NSQ: 'bg-red-100 text-red-800',
  SPURIOUS: 'bg-red-100 text-red-800',
  OVERDUE: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
  SURRENDERED: 'bg-slate-200 text-slate-700',
  WITHDRAWN: 'bg-slate-200 text-slate-700',
};

export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">—</span>;
  const cls = MAP[status.toUpperCase()] || 'bg-slate-100 text-slate-700';
  return <span className={clsx('badge', cls)}>{titleCase(status)}</span>;
}
