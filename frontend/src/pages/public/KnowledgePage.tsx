import { useState } from 'react';
import { BookOpen, ChevronDown, FileText, Scale, Users } from 'lucide-react';

const FAQS = [
  { q: 'How do I apply for a manufacturing licence?', a: 'Register on the Industry Portal, create a new application of type "Manufacturing Licence", upload required documents, e-sign and pay the fee via Bharat Kosh. Your application is then auto-allocated for pre-screening and review.' },
  { q: 'How can I verify the authenticity of a licence or certificate?', a: 'Use the public "Verify Licence / Product" tool and enter the reference number printed on the document (or scan its QR code).' },
  { q: 'What is the SHRESTH Index?', a: 'SHRESTH is a composite index that benchmarks State/UT regulatory performance across inspections, application disposal, grievance resolution and quality surveillance.' },
  { q: 'How do I report an adverse event?', a: 'Adverse events (SAE/AEFI) can be reported via the Vigilance module by registered stakeholders, or imported in CIOMS E2B / ICSR format.' },
  { q: 'How do I file a complaint about a spurious product?', a: 'Use the "File a Grievance" page. You will receive a ticket number to track the resolution status.' },
];

const ACTS = [
  'Drugs and Cosmetics Act, 1940 & Rules, 1945',
  'New Drugs and Clinical Trials Rules, 2019',
  'Medical Devices Rules, 2017',
  'Cosmetics Rules, 2020',
  'Drugs (Prices Control) Order',
];

const COMMITTEES = [
  { name: 'DTAB', full: 'Drugs Technical Advisory Board' },
  { name: 'DCC', full: 'Drugs Consultative Committee' },
  { name: 'SEC', full: 'Subject Expert Committee' },
  { name: 'Ethics Committees', full: 'Institutional Ethics Committees for trials' },
];

export default function KnowledgePage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy-50 text-navy"><BookOpen size={24} /></span>
        <div>
          <h1 className="text-2xl font-bold text-navy">Knowledge & Resources</h1>
          <p className="text-slate-600">Acts, rules, guidelines, committees and frequently asked questions.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><Scale size={18} className="text-saffron" /> Acts & Rules</div>
          <ul className="space-y-2 text-sm text-slate-700">
            {ACTS.map((a) => <li key={a} className="flex items-start gap-2"><FileText size={14} className="mt-0.5 text-navy" /> {a}</li>)}
          </ul>
        </div>
        <div className="card p-6">
          <div className="mb-3 flex items-center gap-2 font-semibold text-ink"><Users size={18} className="text-saffron" /> Advisory Committees</div>
          <ul className="space-y-2 text-sm text-slate-700">
            {COMMITTEES.map((c) => <li key={c.name}><span className="font-semibold">{c.name}</span> — {c.full}</li>)}
          </ul>
        </div>
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold text-navy">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQS.map((f, i) => (
          <div key={i} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left font-medium text-ink">
              {f.q}
              <ChevronDown size={18} className={`transition ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && <div className="border-t border-slate-100 p-4 text-sm text-slate-600">{f.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
