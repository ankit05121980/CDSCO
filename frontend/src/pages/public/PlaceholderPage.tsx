import { Construction } from 'lucide-react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20">
      <div className="card mx-auto max-w-2xl p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-navy-50 text-navy">
          <Construction size={26} />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-2 text-slate-600">
          This module is part of the DDRS platform and is being wired up. Full
          functionality and live data are available in the authenticated portals.
        </p>
      </div>
    </div>
  );
}
