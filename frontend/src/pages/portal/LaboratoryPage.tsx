import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { formatDate, titleCase } from '../../lib/format';

export default function LaboratoryPage() {
  return (
    <div>
      <PageHeader title="Laboratory (LIMS / QMS)" subtitle="Sample receipt, testing, batch release certification, SLP scrutiny and reference standards" />
      <Tabs
        tabs={[
          {
            id: 'samples',
            label: 'Samples',
            content: (
              <DataTable
                endpoint="/laboratory/samples"
                searchPlaceholder="Search by reference, product, batch, lab…"
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'batchNo', label: 'Batch' },
                  { key: 'sampleType', label: 'Type', render: (r: any) => titleCase(r.sampleType) },
                  { key: 'labName', label: 'Laboratory' },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'reports',
            label: 'Test Reports',
            content: (
              <DataTable
                endpoint="/laboratory/reports"
                searchPlaceholder="Search reports…"
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'labName', label: 'Laboratory' },
                  { key: 'analystName', label: 'Analyst' },
                  { key: 'result', label: 'Result', render: (r: any) => <StatusBadge status={r.result === 'STANDARD_QUALITY' ? 'PASS' : r.result === 'SPURIOUS' ? 'SPURIOUS' : 'NSQ'} /> },
                  { key: 'reportDate', label: 'Date', render: (r: any) => formatDate(r.reportDate) },
                ]}
              />
            ),
          },
          {
            id: 'brc',
            label: 'Batch Release',
            content: (
              <DataTable
                endpoint="/laboratory/batch-release"
                searchPlaceholder="Search batch release certificates…"
                columns={[
                  { key: 'referenceNo', label: 'Reference', render: (r: any) => <span className="font-mono text-xs text-navy">{r.referenceNo}</span> },
                  { key: 'productName', label: 'Product' },
                  { key: 'batchNo', label: 'Batch' },
                  { key: 'slpScrutinised', label: 'SLP Scrutiny', render: (r: any) => (r.slpScrutinised ? 'Done' : 'Pending') },
                  { key: 'potency', label: 'Potency' },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]}
              />
            ),
          },
          {
            id: 'standards',
            label: 'Reference Standards',
            content: (
              <DataTable
                endpoint="/laboratory/reference-standards"
                searchPlaceholder="Search reference standards…"
                columns={[
                  { key: 'code', label: 'Code', render: (r: any) => <span className="font-mono text-xs text-navy">{r.code}</span> },
                  { key: 'name', label: 'Name' },
                  { key: 'category', label: 'Category', render: (r: any) => titleCase(r.category) },
                  { key: 'unitsIssued', label: 'Units Issued' },
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
