import { Link } from 'react-router-dom';

/**
 * Government of India / CDSCO masthead.
 * Uses a generic stylized emblem (not the official State Emblem) to evoke the
 * GoI identity without misrepresenting official insignia.
 */
export default function GovHeader({ minimal = false }: { minimal?: boolean }) {
  return (
    <header className="bg-white">
      {/* Top GoI bar */}
      <div className="bg-navy-900 text-white text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          <span className="opacity-90">
            भारत सरकार · Government of India
          </span>
          <div className="hidden items-center gap-4 sm:flex">
            <a href="#main" className="hover:underline">
              Skip to main content
            </a>
            <span className="opacity-70">|</span>
            <span className="opacity-90">A+ A A−</span>
            <span className="opacity-70">|</span>
            <span className="opacity-90">English | हिंदी</span>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <img src="/emblem.svg" alt="CDSCO emblem" className="h-12 w-12" />
        <div className="flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
            Ministry of Health &amp; Family Welfare · Directorate General of Health Services
          </div>
          <Link to="/" className="block">
            <div className="text-lg font-extrabold leading-tight text-navy">
              CDSCO
              <span className="ml-2 font-semibold text-ink">
                Central Drugs Standard Control Organization
              </span>
            </div>
            <div className="text-sm font-semibold text-saffron-dark">
              DDRS — Digital Drugs Regulatory System
            </div>
          </Link>
        </div>
        {!minimal && (
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/verify" className="btn-outline">
              Verify Licence / Product
            </Link>
            <Link to="/login" className="btn-primary">
              Login / Register
            </Link>
          </div>
        )}
      </div>
      <div className="tricolour-strip" />
    </header>
  );
}
