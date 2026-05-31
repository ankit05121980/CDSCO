import { useState } from 'react';
import { api } from '../../lib/api';
import { CheckCircle2, MessageSquareWarning, Search } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatDate } from '../../lib/format';

export default function GrievancePage() {
  const [form, setForm] = useState({ category: 'PRODUCT_QUALITY', subject: '', description: '', complainantName: '', complainantEmail: '' });
  const [ticket, setTicket] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [trackNo, setTrackNo] = useState('');
  const [tracked, setTracked] = useState<any>(null);
  const [trackErr, setTrackErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await api.post('/grievances/public', form);
      setTicket(res.data);
    } finally {
      setBusy(false);
    }
  };

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackErr('');
    setTracked(null);
    try {
      const res = await api.get(`/grievances/track/${encodeURIComponent(trackNo.trim())}`);
      setTracked(res.data);
    } catch {
      setTrackErr('Ticket not found.');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-navy-50 text-navy"><MessageSquareWarning size={24} /></span>
        <div>
          <h1 className="text-2xl font-bold text-navy">Grievance Redressal</h1>
          <p className="text-slate-600">Report counterfeit/substandard products, adverse events or service issues.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="mb-4 font-semibold text-ink">File a Complaint</h3>
          {ticket ? (
            <div className="rounded-lg bg-green-50 p-5 text-center">
              <CheckCircle2 className="mx-auto text-green-600" size={32} />
              <div className="mt-2 font-semibold text-green-800">Complaint registered</div>
              <div className="mt-1 text-sm text-slate-600">Your ticket number is</div>
              <div className="mt-1 font-mono text-lg font-bold text-navy">{ticket.ticketNo}</div>
              <button className="btn-outline mt-4" onClick={() => setTicket(null)}>File another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <div>
                <label className="label">Category</label>
                <select className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {['PRODUCT_QUALITY', 'COUNTERFEIT', 'SERVICE', 'LICENSING', 'OTHER'].map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={3} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Your Name</label><input className="input" value={form.complainantName} onChange={(e) => setForm({ ...form, complainantName: e.target.value })} /></div>
                <div><label className="label">Email</label><input className="input" type="email" value={form.complainantEmail} onChange={(e) => setForm({ ...form, complainantEmail: e.target.value })} /></div>
              </div>
              <button className="btn-primary w-full" disabled={busy}>{busy ? 'Submitting…' : 'Submit Complaint'}</button>
            </form>
          )}
        </div>

        <div className="card h-fit p-6">
          <h3 className="mb-4 font-semibold text-ink">Track Your Complaint</h3>
          <form onSubmit={track} className="flex gap-2">
            <input className="input" placeholder="GRV/2026/000001" value={trackNo} onChange={(e) => setTrackNo(e.target.value)} />
            <button className="btn-primary whitespace-nowrap"><Search size={16} /> Track</button>
          </form>
          {trackErr && <div className="mt-3 text-sm text-red-600">{trackErr}</div>}
          {tracked && (
            <div className="mt-4 rounded-lg border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-navy">{tracked.ticketNo}</span>
                <StatusBadge status={tracked.status} />
              </div>
              <div className="mt-2 font-medium text-ink">{tracked.subject}</div>
              <div className="mt-1 text-sm text-slate-500">Filed: {formatDate(tracked.createdAt)} · Due: {formatDate(tracked.dueDate)}</div>
              {tracked.resolution && <div className="mt-2 rounded bg-green-50 p-2 text-sm text-green-700">{tracked.resolution}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
