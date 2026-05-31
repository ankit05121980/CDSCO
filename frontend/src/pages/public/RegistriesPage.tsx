import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import Tabs from '../../components/ui/Tabs';
import { titleCase } from '../../lib/format';
import { Building2 } from 'lucide-react';

export default function RegistriesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy-50 text-navy"><Building2 size={24} /></span>
        <div>
          <h1 className="text-2xl font-bold text-navy">Public Registries</h1>
          <p className="text-slate-600">Search licensed entities, approved products and notified laboratories.</p>
        </div>
      </div>
      <Tabs
        tabs={[
          {
            id: 'entities', label: 'Licensed Entities',
            content: (
              <DataTable endpoint="/registry/organizations" searchPlaceholder="Search entities…"
                columns={[
                  { key: 'name', label: 'Entity' },
                  { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
                  { key: 'stateName', label: 'State' },
                  { key: 'status', label: 'Status', render: (r: any) => <StatusBadge status={r.status} /> },
                ]} />
            ),
          },
          {
            id: 'products', label: 'Approved Products',
            content: (
              <DataTable endpoint="/products" searchPlaceholder="Search products…"
                columns={[
                  { key: 'brandName', label: 'Brand' },
                  { key: 'name', label: 'Generic' },
                  { key: 'category', label: 'Category', render: (r: any) => titleCase(r.category) },
                  { key: 'manufacturerName', label: 'Manufacturer' },
                ]} />
            ),
          },
          {
            id: 'labs', label: 'Testing Laboratories',
            content: (
              <DataTable endpoint="/registry/laboratories" searchPlaceholder="Search laboratories…"
                columns={[
                  { key: 'name', label: 'Laboratory' },
                  { key: 'type', label: 'Type', render: (r: any) => titleCase(r.type) },
                  { key: 'stateName', label: 'State' },
                  { key: 'nablAccredited', label: 'NABL', render: (r: any) => (r.nablAccredited ? 'Yes' : 'No') },
                ]} />
            ),
          },
        ]}
      />
    </div>
  );
}
