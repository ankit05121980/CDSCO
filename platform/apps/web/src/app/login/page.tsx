'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { api, setTokens } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('acme');
  const [email, setEmail] = useState('admin@acme.test');
  const [password, setPassword] = useState('Passw0rd!');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', {
        organizationSlug: slug,
        email,
        password,
        ...(mfaCode ? { mfaCode } : {}),
      });
      setTokens(res.data.accessToken, res.data.refreshToken);
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Athena</h1>
            <p className="text-xs text-slate-400">Enterprise AI Digital Transformation</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Organization</label>
            <input className="input" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">MFA code (if enabled)</label>
            <input
              className="input"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} /> Protected by JWT, RBAC and MFA. Demo: acme / admin@acme.test / Passw0rd!
        </p>
      </div>
    </div>
  );
}
