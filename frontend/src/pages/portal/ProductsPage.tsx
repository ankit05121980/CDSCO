import { useState } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { titleCase } from '../../lib/format';

const CATEGORIES = ['', 'DRUG', 'BIOLOGICAL', 'MEDICAL_DEVICE', 'IVD', 'COSMETIC', 'VETERINARY', 'AYUSH', 'BLOOD_PRODUCT'];

export default function ProductsPage() {
  const [category, setCategory] = useState('');
  return (
    <div>
      <PageHeader
        title="Product Registry"
        subtitle="All regulated products across drugs, devices, IVDs, cosmetics, veterinary and biologicals"
      />
      <DataTable
        endpoint="/products"
        params={{ category: category || undefined }}
        searchPlaceholder="Search by name, brand, registration no…"
        toolbar={
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c ? titleCase(c) : 'All categories'}</option>
            ))}
          </select>
        }
        columns={[
          { key: 'brandName', label: 'Brand', render: (r: any) => <span className="font-medium text-ink">{r.brandName}</span> },
          { key: 'name', label: 'Generic / Name' },
          { key: 'category', label: 'Category', render: (r: any) => titleCase(r.category) },
          { key: 'dosageForm', label: 'Form', render: (r: any) => r.dosageForm || '—' },
          { key: 'manufacturerName', label: 'Manufacturer' },
          { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
