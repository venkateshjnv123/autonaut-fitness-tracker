// app/page.tsx
'use client';
import React, { JSX, useEffect, useState } from 'react';
import { ScoreEntry, loadTodayLeaderboard } from '../lib/localStore';

export default function HomePage(): JSX.Element {
  const [rows, setRows] = useState<ScoreEntry[]>([]);
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => {
    // load persisted or show demo fallback
    const loaded = loadTodayLeaderboard(today);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (loaded.length > 0) setRows(loaded);
    else {
      // show dummy data if none saved
      setRows([
        { email: 'alice@example.com', name: 'Alice', score: 120 },
        { email: 'bob@example.com', name: 'Bob', score: 95 },
        { email: 'charlie@example.com', name: 'Charlie', score: 80 },
      ]);
    }
  }, [today]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">Today&apos;s Leaderboard</h1>
          <p className="text-muted mt-1">Live ranking for {today}</p>
        </div>
      </div>

      <div className="mb-6">
  <p className="text-center text-zinc-400 text-sm italic">
    Don’t worry — take a second chance and beat everyone today!
  </p>
</div>

<div className="space-y-3">
  {rows.map((r, idx) => {
    const rank = idx + 1;

    const crown =
      rank === 1 ? "👑" :
      rank === 2 ? "🥈" :
      rank === 3 ? "🥉" : null;

    return (
      <div
        key={r.email}
        className="flex items-center justify-between bg-zinc-900 px-4 py-3 rounded-lg hover:bg-zinc-800 transition"
      >
        {/* Left Section */}
        <div className="flex items-center gap-3 min-w-0">
          
          {/* Rank */}
          <div className="w-8 text-center text-lg font-bold text-zinc-300">
            {crown ? crown : `#${rank}`}
          </div>

          {/* User Info */}
          <div className="min-w-0">
            <div className="font-semibold truncate text-white">
              {r.name || r.email}
            </div>
            <div className="text-xs text-zinc-500 truncate">{r.email}</div>
          </div>
        </div>

        {/* Score */}
        <div className="text-2xl font-bold tabular-nums text-orange-500">
          {r.score}
        </div>
      </div>
    );
  })}
</div>

    </div>
  );
}
