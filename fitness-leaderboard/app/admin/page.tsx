// app/admin/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { saveTodayScore, loadTodayLeaderboard } from '../../lib/localStore';

export default function AdminPage() {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [score, setScore] = useState<number | ''>('');
  const [msg, setMsg] = useState<string>('');
  const [scores, setScores] = useState<any[]>([]);
  const date = new Date().toISOString().slice(0, 10);

  // Load current leaderboard
  useEffect(() => {
    const leaderboard = loadTodayLeaderboard(date);
    setScores(leaderboard);
  }, [date]);

  function showMsg(t: string, delay = 2000) {
    setMsg(t);
    setTimeout(() => setMsg(''), delay);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || score === '') {
      showMsg('Provide email and score');
      return;
    }
    
    saveTodayScore(date, email, name || undefined, Number(score));
    setScore('');
    showMsg('Score saved successfully');
    
    // Refresh leaderboard
    const leaderboard = loadTodayLeaderboard(date);
    setScores(leaderboard);
  }

  return (
    <div className="space-y-8">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Score</h2>

        <form onSubmit={submit} className="bg-zinc-900 rounded-lg p-6">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-zinc-300">Email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input" 
              type="email" 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-zinc-300">Name (optional)</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="input" 
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-zinc-300">Score</label>
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
            <div className="text-sm text-zinc-400">{date}</div>
            <button className="btn" type="submit">
              Submit
            </button>
          </div>

          {msg && <div className="mt-3 text-sm text-zinc-300">{msg}</div>}
        </form>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Today's Leaderboard</h2>
        <div className="bg-zinc-900 rounded-lg p-4">
          {scores.length === 0 ? (
            <p className="text-zinc-400">No scores recorded for today.</p>
          ) : (
            <div className="space-y-2">
              {scores.map((entry, index) => (
                <div key={entry.email} className="flex justify-between items-center p-3 border-b border-zinc-800 last:border-0">
                  <div>
                    <div className="font-medium">{entry.name || entry.email}</div>
                    <div className="text-xs text-zinc-400">{entry.email}</div>
                  </div>
                  <div className="text-xl font-bold text-orange-500">{entry.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
