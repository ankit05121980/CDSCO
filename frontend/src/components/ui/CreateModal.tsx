import { useState } from 'react';
import Modal from './Modal';
import { api } from '../../lib/api';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'textarea' | 'date';
  options?: string[];
  required?: boolean;
  default?: any;
  placeholder?: string;
  half?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  fields: FormField[];
  onCreated?: (record: any) => void;
}

export default function CreateModal({ open, onClose, title, endpoint, fields, onCreated }: Props) {
  const init = () => {
    const o: any = {};
    fields.forEach((f) => (o[f.name] = f.default ?? (f.type === 'select' ? f.options?.[0] : '')));
    return o;
  };
  const [form, setForm] = useState<any>(init);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const payload: any = {};
      fields.forEach((f) => {
        let v = form[f.name];
        if (f.type === 'number' && v !== '' && v != null) v = Number(v);
        if (v !== '' && v != null) payload[f.name] = v;
      });
      const res = await api.post(endpoint, payload);
      onCreated?.(res.data);
      setForm(init());
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not create record');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      {error && <div className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{Array.isArray(error) ? error.join(', ') : error}</div>}
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name} className={f.half ? '' : 'col-span-2'}>
            <label className="label">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
            {f.type === 'select' ? (
              <select className="select" value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                {f.options?.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea className="input" rows={3} value={form[f.name]} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            ) : (
              <input className="input" type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'} value={form[f.name]} placeholder={f.placeholder} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving…' : 'Create'}</button>
      </div>
    </Modal>
  );
}
