'use client';

import { useRef, useState } from 'react';
import { Send, Bot, User, Quote } from 'lucide-react';
import { api } from '@/lib/api';

interface Citation {
  marker: string;
  sourceType: string;
  sourceId: string;
  snippet: string;
}
interface Msg {
  role: 'user' | 'assistant';
  text: string;
  citations?: Citation[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(`web-${Date.now()}`);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: text, sessionId: sessionId.current });
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: res.data.answer, citations: res.data.citations },
      ]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <h1 className="mb-4 text-2xl font-semibold">AI Assistant</h1>
      <div className="card flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            Ask anything about your documents and knowledge base. Answers are grounded with citations
            via Retrieval-Augmented Generation. Try: “How is data encrypted at rest?”
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
            {m.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <Bot size={16} />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{m.text}</p>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2 space-y-1 border-t border-slate-300/40 pt-2 text-xs text-slate-500">
                  {m.citations.map((c) => (
                    <div key={c.marker} className="flex gap-1">
                      <Quote size={12} className="mt-0.5 shrink-0" />
                      <span>
                        <b>{c.marker}</b> {c.sourceType}: {c.snippet.slice(0, 90)}…
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {m.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-300 dark:bg-slate-700">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {loading && <p className="text-sm text-slate-400">Thinking…</p>}
      </div>
      <form onSubmit={send} className="mt-4 flex gap-2">
        <input
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the enterprise assistant…"
        />
        <button className="btn-primary" disabled={loading}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
