import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-navy-900 text-slate-200">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <img src="/emblem.svg" alt="" className="h-8 w-8" />
            <span className="font-bold text-white">CDSCO · DDRS</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Digital Drugs Regulatory System — India's unified digital public
            infrastructure for drug, medical device, cosmetic and biological
            regulation.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Services</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Licensing &amp; Approvals</li>
            <li>Clinical Trials</li>
            <li>Inspections &amp; Enforcement</li>
            <li>Laboratory (LIMS)</li>
            <li>Vigilance &amp; Safety</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Resources</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/knowledge" className="hover:text-white">Acts &amp; Rules</Link></li>
            <li><Link to="/knowledge" className="hover:text-white">Guidelines &amp; FAQs</Link></li>
            <li><Link to="/alerts" className="hover:text-white">Drug &amp; Cosmetic Alerts</Link></li>
            <li><Link to="/registries" className="hover:text-white">Public Registries</Link></li>
            <li><Link to="/grievance" className="hover:text-white">Grievance Redressal</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-white">Policies</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Accessibility (GIGW)</li>
            <li>Privacy Policy (DPDP)</li>
            <li>Terms of Use</li>
            <li>Information Security (ISO 27001)</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-400 sm:flex-row">
          <span>
            © {year} Central Drugs Standard Control Organization, Government of
            India. All rights reserved.
          </span>
          <span>
            Demonstration build · Last updated {new Date().toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>
    </footer>
  );
}
