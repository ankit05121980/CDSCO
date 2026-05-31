import clsx from 'clsx';

interface Props {
  label: string;
  value: string | number;
  icon?: any;
  hint?: string;
  tone?: 'navy' | 'saffron' | 'green' | 'red' | 'slate';
}

const TONE: Record<string, string> = {
  navy: 'bg-navy-50 text-navy',
  saffron: 'bg-saffron/10 text-saffron-dark',
  green: 'bg-green-50 text-green-700',
  red: 'bg-red-50 text-red-700',
  slate: 'bg-slate-100 text-slate-700',
};

export default function StatCard({ label, value, icon: Icon, hint, tone = 'navy' }: Props) {
  return (
    <div className="card flex items-center gap-4 p-5">
      {Icon && (
        <span className={clsx('grid h-12 w-12 shrink-0 place-items-center rounded-lg', TONE[tone])}>
          <Icon size={22} />
        </span>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold text-ink">{value}</div>
        <div className="truncate text-sm text-slate-500">{label}</div>
        {hint && <div className="text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}
