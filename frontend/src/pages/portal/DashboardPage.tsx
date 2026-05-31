import { useAuth } from '../../lib/auth';
import { ROLE_LABEL } from '../../lib/roles';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { FileText, ClipboardCheck, ShieldAlert, Activity, Users, ScrollText } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => (await api.get('/analytics/summary')).data,
    retry: false,
  });

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(' ')[0] || 'User'}`}
        subtitle={`${ROLE_LABEL[user?.primaryRole || '']} · ${user?.office || user?.stateCode || 'DDRS Portal'}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={summary?.applications ?? '—'} icon={FileText} tone="navy" />
        <StatCard label="Inspections" value={summary?.inspections ?? '—'} icon={ClipboardCheck} tone="saffron" />
        <StatCard label="Enforcement Cases" value={summary?.enforcement ?? '—'} icon={ShieldAlert} tone="red" />
        <StatCard label="Adverse Events" value={summary?.adverseEvents ?? '—'} icon={Activity} tone="green" />
        <StatCard label="Registered Entities" value={summary?.entities ?? '—'} icon={Users} tone="navy" />
        <StatCard label="Products" value={summary?.products ?? '—'} icon={FileText} tone="slate" />
        <StatCard label="Lab Samples" value={summary?.samples ?? '—'} icon={ClipboardCheck} tone="saffron" />
        <StatCard label="Audit Events" value={summary?.auditEvents ?? '—'} icon={ScrollText} tone="slate" />
      </div>

      <div className="mt-6 card p-6">
        <h3 className="font-semibold text-navy">Welcome to the Digital Drugs Regulatory System</h3>
        <p className="mt-2 text-sm text-slate-600">
          Use the navigation on the left to access modules available to your role.
          This unified platform covers the complete regulatory lifecycle — from
          registration and licensing to clinical trials, inspections, enforcement,
          vigilance, laboratory testing, supply-chain traceability and analytics.
        </p>
      </div>
    </div>
  );
}
