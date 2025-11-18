// app/history/page.tsx
'use client';
import React, { JSX, useEffect, useState } from 'react';
import { getLocalUser } from '../../lib/clientAuth';

type HistoryMap = Record<string, string>;

export default function HistoryPage(): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [history, setHistory] = useState<HistoryMap>({});
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const u = getLocalUser();
    if (u?.email) setEmail(u.email);
  }, []);

  async function loadHistory(e?: React.FormEvent) {
    e && e.preventDefault();
    if (!email) {
      setMsg('Enter email');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const resp = await fetch(`/api/history?email=${encodeURIComponent(email)}`);
      const data = await resp.json();
      if (resp.ok) {
        setHistory(data.history || {});
      } else {
        setMsg(data.error || 'Error loading history');
      }
    } catch (err) {
      console.error(err);
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-white">Score History</h2>
        <form onSubmit={loadHistory} className="flex w-full sm:w-auto gap-2">
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" type="email" />
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
        </form>
      </div>

      {msg && <div className="text-sm text-red-500 mb-3">{msg}</div>}

      <div className="bg-zinc-900 rounded-lg p-4 text-white">
        {Object.keys(history).length === 0 ? (
          <div className="text-gray-400">No history found.</div>
        ) : (
          <ul className="space-y-2">
            {Object.entries(history).sort((a, b) => b[0].localeCompare(a[0])).map(([date, score]) => (
              <li key={date} className="py-2 border-b border-zinc-800 last:border-0 flex justify-between">
                <div className="text-sm">{date}</div>
                <div className="font-semibold">{score}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
