import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { formatDate, titleCase } from '../../lib/format';

export default function EnforcementPage() {
  return (
    <div>
      <PageHeader title="Enforcement" subtitle="Sampling, NSQ/spurious detection, recalls, inter-state coordination and prosecution" />
      <Tabs
        tabs={[
          {
            id: 'cases',
            label: 'Cases',
            content: (
              <DataTable
                endpoint="/enforcement/cases"
                searchPlaceholder="Search by product, brand, batch, manufacturer…"
                create={{
                  title: 'New Enforcement Case',
                  fields: [
                    { name: 'type', label: 'Type', type: 'select', options: ['SAMPLING', 'NSQ', 'SPURIOUS', 'INVESTIGATION', 'QUALITY_MONITORING'] },
                    { name: 'productName', label: 'Product', required: true, half: true },
                    { name: 'brandName', label: 'Brand', half: true },
                    { name: 'batchNo', label: 'Batch No', half: true },
                    { name: 'manufacturerName', label: 'Manufacturer', half: true },
                    { name: 'classification', label: 'Classification', type: 'select', options: ['NSQ', 'SPURIOUS', 'ADULTERATED', 'MISBRANDED', 'STANDARD'], half: true },
                    { name: 'severity', label: 'Severity', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], half: true },
                    { name: 'actionTaken', label: 'Action Taken', type: 'textarea' },
                  ],
                }}
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
                  { key: 'productName', label: 'Product' },
                  { key: 'batchNo', label: 'Batch' },
                  { key: 'classification', label: 'Classification', render: (r: any) => <StatusBadge status={r.classification} /> },
                  { key: 'interState', label: 'Inter-State', render: (r: any) => (r.interState ? 'Yes' : 'No') },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'recalls',
            label: 'Recalls',
            content: (
              <DataTable
                endpoint="/enforcement/recalls"
                searchPlaceholder="Search recalls…"
                create={{
                  title: 'Initiate Product Recall',
                  fields: [
                    { name: 'productName', label: 'Product', required: true },
                    { name: 'brandName', label: 'Brand', half: true },
                    { name: 'batchNo', label: 'Batch No', half: true },
                    { name: 'manufacturerName', label: 'Manufacturer', half: true },
                    { name: 'classification', label: 'Class', type: 'select', options: ['CLASS_I', 'CLASS_II', 'CLASS_III'], half: true },
                    { name: 'quantitySupplied', label: 'Qty Supplied', type: 'number', half: true },
                    { name: 'quantityRecalled', label: 'Qty Recalled', type: 'number', half: true },
                    { name: 'reason', label: 'Reason', type: 'textarea' },
                  ],
                }}
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'batchNo', label: 'Batch' },
                  { key: 'classification', label: 'Class', render: (r: any) => r.classification?.replace('_', ' ') },
                  { key: 'quantityRecalled', label: 'Recalled / Supplied', render: (r: any) => `${r.quantityRecalled?.toLocaleString('en-IN')} / ${r.quantitySupplied?.toLocaleString('en-IN')}` },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'court',
            label: 'Court Cases',
            content: (
              <DataTable
                endpoint="/enforcement/court-cases"
                searchPlaceholder="Search by case no, court, parties…"
                columns={[
                  { key: 'caseNo', label: 'Case No', render: (r: any) => <span className="font-mono text-xs text-navy">{r.caseNo}</span> },
                  { key: 'court', label: 'Court' },
                  { key: 'parties', label: 'Parties' },
                  { key: 'filedDate', label: 'Filed', render: (r: any) => formatDate(r.filedDate) },
                  { key: 'nextHearing', label: 'Next Hearing', render: (r: any) => formatDate(r.nextHearing) },
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
