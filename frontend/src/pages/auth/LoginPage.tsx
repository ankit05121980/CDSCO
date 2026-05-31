import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import GovHeader from '../../components/GovHeader';
import { ShieldCheck, KeyRound, Smartphone, Fingerprint } from 'lucide-react';

const DEMO = [
  { email: 'admin@cdsco.demo', label: 'Super Admin' },
  { email: 'dcgi@cdsco.demo', label: 'DCGI (Central)' },
  { email: 'reviewer@cdsco.demo', label: 'Review Officer' },
  { email: 'inspector@cdsco.demo', label: 'Drug Inspector' },
  { email: 'sla.mh@cdsco.demo', label: 'State Authority' },
  { email: 'labmgr@cdsco.demo', label: 'Lab Manager' },
  { email: 'manufacturer@demo.in', label: 'Manufacturer' },
  { email: 'cro@demo.in', label: 'CRO' },
];

type Tab = 'password' | 'otp' | 'aadhaar';

export default function LoginPage() {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('password');
  const [email, setEmail] = useState('dcgi@cdsco.demo');
  const [password, setPassword] = useState('Ddrs@2026');
  const [otpSent, setOtpSent] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [aadhaar, setAadhaar] = useState('999912345678');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = () => navigate('/app');

  const doPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      go();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/auth/otp/request', { identifier: email });
      setOtpSent(res.data.demoOtp);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send OTP');
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/auth/otp/verify', { identifier: email, otp });
      loginWithToken(res.data.accessToken, res.data.user);
      go();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  };

  const doAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post('/auth/aadhaar', { aadhaar, email });
      loginWithToken(res.data.accessToken, res.data.user);
      go();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Aadhaar login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <GovHeader minimal />
      <div className="grid flex-1 lg:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-center bg-gradient-to-br from-navy-900 to-navy-600 p-12 text-white lg:flex">
          <ShieldCheck size={48} className="text-saffron-light" />
          <h2 className="mt-6 text-3xl font-extrabold">Secure Regulatory Access</h2>
          <p className="mt-3 max-w-md text-slate-200">
            One unified login for CDSCO officers, State Licensing Authorities,
            testing laboratories, industry and citizens. Multi-factor sign-in via
            password, OTP, or Aadhaar/DigiLocker.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-slate-300">
            <li>• Role-based access control across 19 stakeholder roles</li>
            <li>• Full audit trail of every action (ISO 27001 aligned)</li>
            <li>• DPDP-compliant conditional data access</li>
          </ul>
        </div>

        {/* Right form */}
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-navy">Sign in to DDRS</h1>
            <p className="mt-1 text-sm text-slate-500">
              Digital Drugs Regulatory System
            </p>

            <div className="mt-6 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm">
              {([
                ['password', 'Password', KeyRound],
                ['otp', 'OTP', Smartphone],
                ['aadhaar', 'Aadhaar', Fingerprint],
              ] as [Tab, string, any][]).map(([t, label, Icon]) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 font-medium ${
                    tab === t ? 'bg-white text-navy shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {tab === 'password' && (
              <form onSubmit={doPassword} className="mt-5 space-y-4">
                <Field label="Email">
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Password">
                  <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                <button className="btn-primary w-full" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign In'}
                </button>
              </form>
            )}

            {tab === 'otp' && (
              <form onSubmit={verifyOtp} className="mt-5 space-y-4">
                <Field label="Email / Registered ID">
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                {otpSent && (
                  <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Demo OTP: <span className="font-bold">{otpSent}</span> (simulated SMS/email)
                  </div>
                )}
                {!otpSent ? (
                  <button type="button" onClick={requestOtp} className="btn-primary w-full" disabled={busy}>
                    Send OTP
                  </button>
                ) : (
                  <>
                    <Field label="Enter OTP">
                      <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </Field>
                    <button className="btn-primary w-full" disabled={busy}>Verify & Sign In</button>
                  </>
                )}
              </form>
            )}

            {tab === 'aadhaar' && (
              <form onSubmit={doAadhaar} className="mt-5 space-y-4">
                <Field label="Aadhaar Number (12 digits)">
                  <input className="input" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
                </Field>
                <Field label="Email">
                  <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <p className="text-xs text-slate-400">
                  Simulated DigiLocker / UIDAI authentication for demonstration.
                </p>
                <button className="btn-primary w-full" disabled={busy}>
                  Sign in with Aadhaar
                </button>
              </form>
            )}

            <div className="mt-8">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick demo accounts (password: Ddrs@2026)
              </div>
              <div className="flex flex-wrap gap-2">
                {DEMO.map((d) => (
                  <button
                    key={d.email}
                    onClick={() => { setEmail(d.email); setTab('password'); setPassword('Ddrs@2026'); }}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:border-navy hover:text-navy"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
