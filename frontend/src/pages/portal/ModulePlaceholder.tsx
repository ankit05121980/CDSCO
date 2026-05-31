import PageHeader from '../../components/ui/PageHeader';
import { Hammer } from 'lucide-react';

export default function ModulePlaceholder({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="card grid place-items-center p-16 text-center">
        <Hammer className="mb-3 text-saffron" size={28} />
        <p className="max-w-md text-slate-500">
          The <strong>{title}</strong> module is part of the DDRS platform and is
          being delivered in the current build phase.
        </p>
      </div>
    </div>
  );
}
