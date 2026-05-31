import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import { api } from '../../lib/api';
import { formatDateTime, formatINR } from '../../lib/format';
import { CreditCard, Wallet, RotateCcw } from 'lucide-react';

export default function PaymentsPage() {
  const { data: stats } = useQuery({
    queryKey: ['payments-stats'],
    queryFn: async () => (await api.get('/payments/stats')).data,
  });
  const paid = stats?.byStatus?.find((s: any) => s.status === 'PAID');
  const refunded = stats?.byStatus?.find((s: any) => s.status === 'REFUNDED');

  return (
    <div>
      <PageHeader title="Payments & Treasury" subtitle="Fee collection via Bharat Kosh (pay.gov.in) and State Treasuries — with refunds & reconciliation" />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Collected" value={formatINR(stats?.totalCollected || 0)} icon={Wallet} tone="green" />
        <StatCard label="Paid Transactions" value={paid?.count || 0} icon={CreditCard} tone="navy" />
        <StatCard label="Refunds Processed" value={refunded?.count || 0} icon={RotateCcw} tone="saffron" />
      </div>

      <DataTable
        endpoint="/payments"
        searchPlaceholder="Search by reference, payer, txn…"
        columns={[
          { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
          { key: 'applicationRef', label: 'Application' },
          { key: 'payerName', label: 'Payer' },
          { key: 'amount', label: 'Amount', render: (r: any) => formatINR(r.amount) },
          { key: 'gateway', label: 'Gateway', render: (r: any) => (r.gateway === 'BHARAT_KOSH' ? 'Bharat Kosh' : 'State Treasury') },
          { key: 'mode', label: 'Mode' },
          { key: 'paidAt', label: 'Paid At', render: (r: any) => formatDateTime(r.paidAt) },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
