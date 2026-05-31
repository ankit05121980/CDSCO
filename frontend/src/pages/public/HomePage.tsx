import { Link } from 'react-router-dom';
import {
  FileCheck2,
  FlaskConical,
  ShieldAlert,
  Microscope,
  Activity,
  Boxes,
  Stethoscope,
  Building2,
  Search,
  ArrowRight,
} from 'lucide-react';

const services = [
  { icon: FileCheck2, title: 'Licensing & Approvals', desc: 'Manufacturing, import, sale, test licences & market authorisation across all product categories.' },
  { icon: FlaskConical, title: 'Clinical Trials', desc: 'CT, GCT, BA/BE, PMS, academic trials, ethics committees & site management.' },
  { icon: Microscope, title: 'Inspections', desc: 'Risk-based, joint Centre–State inspections with geo-tagging and digital reports.' },
  { icon: ShieldAlert, title: 'Enforcement', desc: 'Sampling, NSQ/spurious alerts, recalls, court cases and inter-state coordination.' },
  { icon: Activity, title: 'Vigilance & Safety', desc: 'Pharmaco-, Materio- & Haemovigilance, adverse events, PSUR and compensation.' },
  { icon: Microscope, title: 'Laboratory (LIMS)', desc: 'Sample receipt, testing, batch release, SLP scrutiny and reference standards.' },
  { icon: Boxes, title: 'Supply Chain Track & Trace', desc: 'Batch-level QR traceability from sourcing to consumption.' },
  { icon: Stethoscope, title: 'Returns & Reporting', desc: 'Periodic return filing, MIS dashboards and SHRESTH state benchmarking.' },
];

const stats = [
  { label: 'Regulated Entities', value: '8,00,000+' },
  { label: 'Products Registered', value: '2,500+' },
  { label: 'Applications Processed', value: '5,000+' },
  { label: 'Testing Laboratories', value: '435+' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-700 to-navy-600 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 lg:grid-cols-2">
          <div>
            <span className="badge bg-saffron/20 text-saffron-light ring-1 ring-saffron/40">
              India's DPI for Drug Regulation
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Digital Drugs Regulatory System
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-200">
              A unified, paperless, API-first platform connecting CDSCO, State
              Licensing Authorities, testing laboratories, industry and citizens —
              ensuring quality medical products for India and the world.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/login" className="btn-saffron">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/verify" className="btn-outline bg-white/10 text-white hover:bg-white/20">
                <Search size={16} /> Verify a Licence / Product
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 p-5 ring-1 ring-white/15">
                <div className="text-3xl font-extrabold text-saffron-light">{s.value}</div>
                <div className="mt-1 text-sm text-slate-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="mx-auto -mt-8 max-w-7xl px-4">
        <div className="grid gap-4 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-3">
          {[
            { to: '/alerts', icon: ShieldAlert, label: 'Drug & Cosmetic Alerts', sub: 'NSQ, spurious & recalls' },
            { to: '/registries', icon: Building2, label: 'Public Registries', sub: 'Licensed entities & products' },
            { to: '/grievance', icon: FileCheck2, label: 'File a Grievance', sub: 'Online complaint redressal' },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-navy-200 hover:bg-navy-50"
            >
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-navy-50 text-navy">
                <a.icon size={20} />
              </span>
              <span>
                <span className="block font-semibold text-ink">{a.label}</span>
                <span className="block text-xs text-slate-500">{a.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-navy">Comprehensive Regulatory Services</h2>
          <p className="mt-2 text-slate-600">
            End-to-end digital management of the complete regulatory lifecycle.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="card p-5 transition hover:shadow-cardhover">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-saffron/10 text-saffron-dark">
                <s.icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
