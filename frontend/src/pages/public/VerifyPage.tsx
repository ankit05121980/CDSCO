import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { ShieldCheck, ShieldX, Search } from 'lucide-react';
import { formatDate, titleCase } from '../../lib/format';

export default function VerifyPage() {
  const [params] = useSearchParams();
  const [ref, setRef] = useState(params.get('ref') || '');
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);

  const runVerify = async (value: string) => {
    if (!value.trim()) return;
    setBusy(true);
    setSearched(true);
    try {
      const res = await api.get(`/verify/${encodeURIComponent(value.trim())}`);
      setResult(res.data);
    } catch {
      setResult({ kind: 'NONE', valid: false });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const q = params.get('ref');
    if (q) runVerify(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    runVerify(ref);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navy">Verify Licence / Certificate</h1>
        <p className="mt-2 text-slate-600">
          Authenticate any DDRS-issued licence, certificate or NOC using its reference number or QR code.
        </p>
      </div>

      <form onSubmit={verify} className="mx-auto mt-8 flex max-w-xl gap-2">
        <input
          className="input"
          placeholder="e.g. CDSCO/LIC/2026/100001"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
        />
        <button className="btn-primary whitespace-nowrap" disabled={busy}>
          <Search size={16} /> {busy ? 'Verifying…' : 'Verify'}
        </button>
      </form>

      {searched && result && (
        <div className="mt-8">
          {result.kind === 'NONE' || !result.record ? (
            <div className="card flex items-center gap-4 border-red-200 bg-red-50 p-6">
              <ShieldX className="text-red-600" size={32} />
              <div>
                <div className="font-semibold text-red-800">No matching record found</div>
                <div className="text-sm text-red-700">Please check the reference number and try again.</div>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className={`flex items-center gap-3 p-5 ${result.valid ? 'bg-green-50' : 'bg-amber-50'}`}>
                {result.valid ? <ShieldCheck className="text-green-600" size={28} /> : <ShieldX className="text-amber-600" size={28} />}
                <div>
                  <div className={`font-semibold ${result.valid ? 'text-green-800' : 'text-amber-800'}`}>
                    {result.valid ? 'Valid & Authentic' : 'Record found — not currently active'}
                  </div>
                  <div className="text-sm text-slate-600">{titleCase(result.kind)} verified against the DDRS registry</div>
                </div>
              </div>
              <div className="grid gap-6 p-6 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <Item label="Reference" value={result.record.referenceNo} mono />
                    <Item label="Type" value={result.record.licenceType || result.record.certType} />
                    <Item label="Holder" value={result.record.holderName} />
                    <Item label="Status" value={titleCase(result.record.status)} />
                    <Item label="Issued" value={formatDate(result.record.issueDate)} />
                    <Item label="Valid To" value={formatDate(result.record.validTo)} />
                  </dl>
                </div>
                {result.qr && (
                  <div className="flex flex-col items-center justify-center">
                    <img src={result.qr} alt="QR" className="h-36 w-36 rounded border border-slate-200" />
                    <span className="mt-2 text-xs text-slate-400">Scan to verify</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Item({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-0.5 font-medium text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</dd>
    </div>
  );
}
