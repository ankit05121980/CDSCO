import { useAuth } from '../../lib/auth';
import { ROLE_LABEL } from '../../lib/roles';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { ChartCard, DonutChart, BarChartH, TrendLine } from '../../components/ui/Charts';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/format';
import { FileText, ClipboardCheck, ShieldAlert, Activity, Building2, FlaskConical, Microscope, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  });
  const s = data?.summary || {};

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.fullName?.split(' ')[0] || 'User'}`}
        subtitle={`${ROLE_LABEL[user?.primaryRole || '']} · ${user?.office || user?.stateCode || 'DDRS Portal'}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={fmt(s.applications)} icon={FileText} tone="navy" />
        <StatCard label="Licences Issued" value={fmt(s.licenses)} icon={FileText} tone="green" />
        <StatCard label="Inspections" value={fmt(s.inspections)} icon={ClipboardCheck} tone="saffron" />
        <StatCard label="Enforcement Cases" value={fmt(s.enforcement)} icon={ShieldAlert} tone="red" />
        <StatCard label="Registered Entities" value={fmt(s.entities)} icon={Building2} tone="navy" />
        <StatCard label="Clinical Trials" value={fmt(s.trials)} icon={FlaskConical} tone="slate" />
        <StatCard label="Lab Samples" value={fmt(s.samples)} icon={Microscope} tone="saffron" />
        <StatCard label="Adverse Events" value={fmt(s.adverseEvents)} icon={Activity} tone="green" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <StatCard label="Fees Collected (Bharat Kosh / Treasury)" value={formatINR(data?.revenueCollected || 0)} icon={Wallet} tone="green" />
        <StatCard label="Product Registrations" value={fmt(s.products)} icon={FileText} tone="navy" />
        <StatCard label="Recalls Tracked" value={fmt(s.recalls)} icon={ShieldAlert} tone="red" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Application Submissions (last 12 months)">
          {data?.trend ? <TrendLine data={data.trend} /> : null}
        </ChartCard>
        <ChartCard title="Applications by Status">
          {data?.appsByStatus ? <DonutChart data={data.appsByStatus} /> : null}
        </ChartCard>
        <ChartCard title="Applications by Type">
          {data?.appsByType ? <BarChartH data={data.appsByType} /> : null}
        </ChartCard>
        <ChartCard title="Enforcement by Classification">
          {data?.enforcementByClass ? <DonutChart data={data.enforcementByClass} /> : null}
        </ChartCard>
        <ChartCard title="Lab Test Results">
          {data?.labByResult ? <DonutChart data={data.labByResult} /> : null}
        </ChartCard>
        <ChartCard title="Vigilance Reports by Type">
          {data?.vigilanceByType ? <BarChartH data={data.vigilanceByType} color="#138808" /> : null}
        </ChartCard>
      </div>
    </div>
  );
}

function fmt(n?: number) {
  return n != null ? n.toLocaleString('en-IN') : '—';
}
