import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { formatDate, formatINR, titleCase } from '../../lib/format';

export default function VigilancePage() {
  return (
    <div>
      <PageHeader title="Vigilance & Safety" subtitle="Pharmacovigilance (PvPI), Materiovigilance (MvPI), Haemovigilance (HvPI), SAE, AEFI, PSUR & compensation" />
      <Tabs
        tabs={[
          {
            id: 'events',
            label: 'Adverse Events',
            content: (
              <DataTable
                endpoint="/vigilance/events"
                searchPlaceholder="Search by reference, product, reporter…"
                create={{
                  title: 'Report Adverse Event',
                  fields: [
                    { name: 'type', label: 'Type', type: 'select', options: ['SAE', 'AEFI', 'PV', 'MV', 'HV', 'ICSR'] },
                    { name: 'productName', label: 'Product', required: true, half: true },
                    { name: 'seriousness', label: 'Seriousness', type: 'select', options: ['DEATH', 'HOSPITALISATION', 'DISABILITY', 'LIFE_THREATENING', 'OTHER'], half: true },
                    { name: 'reporterType', label: 'Reporter', type: 'select', options: ['PHYSICIAN', 'MANUFACTURER', 'CONSUMER', 'HOSPITAL'], half: true },
                    { name: 'patientAgeGroup', label: 'Age Group', type: 'select', options: ['0-1', '2-12', '13-18', '19-44', '45-64', '65+'], half: true },
                    { name: 'outcome', label: 'Outcome', half: true },
                  ],
                }}
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'type', label: 'Type', render: (r: any) => r.type },
                  { key: 'productName', label: 'Product' },
                  { key: 'seriousness', label: 'Seriousness', render: (r: any) => titleCase(r.seriousness) },
                  { key: 'causality', label: 'Causality', render: (r: any) => titleCase(r.causality) },
                  { key: 'source', label: 'Source' },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'psur',
            label: 'PSUR',
            content: (
              <DataTable
                endpoint="/vigilance/psur"
                searchPlaceholder="Search PSUR…"
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'manufacturerName', label: 'Manufacturer' },
                  { key: 'periodFrom', label: 'Period', render: (r: any) => `${formatDate(r.periodFrom)} – ${formatDate(r.periodTo)}` },
                  { key: 'casesReported', label: 'Cases' },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'compensation',
            label: 'Compensation',
            content: (
              <DataTable
                endpoint="/vigilance/compensation"
                searchPlaceholder="Search compensation claims…"
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'claimantName', label: 'Claimant' },
                  { key: 'trialRef', label: 'Trial' },
                  { key: 'amountClaimed', label: 'Claimed', render: (r: any) => formatINR(r.amountClaimed) },
                  { key: 'amountAwarded', label: 'Awarded', render: (r: any) => formatINR(r.amountAwarded) },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
