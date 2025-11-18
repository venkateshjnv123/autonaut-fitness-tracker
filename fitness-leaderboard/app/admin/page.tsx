// app/admin/page.tsx
'use client';
import React, { JSX, useEffect, useState } from 'react';
import { getLocalUser } from '../../lib/clientAuth';

type ApiResponse = { ok?: boolean; error?: string };

export default function AdminPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [score, setScore] = useState<number | ''>('');
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const date = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const u = getLocalUser();
    if (u) {
      setEmail(u.email || '');
      setName(u.name || '');
    }
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    if (!email || score === '') {
      setMsg('Provide email and score');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('/api/add-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, score: Number(score), date }),
      });
      const data = (await resp.json()) as ApiResponse;
      if (resp.ok && data.ok) {
        setMsg('Score saved');
        setScore('');
      } else {
        setMsg(data.error || 'Error saving');
      }
    } catch (err) {
      console.error(err);
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Enter Score</h2>

      <form onSubmit={submit} className="bg-white rounded-lg p-6 shadow">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" type="email" required />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1 text-gray-700">Name (optional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Score</label>
          <input
            value={score}
            onChange={(e) => setScore(e.target.value === '' ? '' : Number(e.target.value))}
            className="input"
            type="number"
            min={0}
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{date}</div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Submit'}
          </button>
        </div>

        {msg && <div className="mt-3 text-sm text-red-600">{msg}</div>}
      </form>
    </div>
  );
}
