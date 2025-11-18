"use client";
import React, { useEffect, useState } from "react";
import { loadUserHistory, saveTodayScore, loadTodayLeaderboard } from "../../lib/localStore";

type HistoryMap = Record<string, string>;

export default function ProfilePage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [history, setHistory] = useState<HistoryMap>({});
  const [score, setScore] = useState<number | "">("");
  const [msg, setMsg] = useState<string>("");

  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
  const [adminPass, setAdminPass] = useState<string>("");
  const [otherEmail, setOtherEmail] = useState<string>("");
  const [otherName, setOtherName] = useState<string>("");
  const [otherScore, setOtherScore] = useState<number | "">("");

  const DEMO_PASSWORD = "123456"; // login password
  const ADMIN_PASSWORD = "adminpass"; // admin unlock

  // Load current session from localStorage
  useEffect(() => {
    try {
      const storedEmail = localStorage.getItem("ft_current_email");
      const storedName = localStorage.getItem("ft_current_name");

      if (storedEmail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(storedEmail);
        setName(storedName || "");
        setLoggedIn(true);
        setHistory(loadUserHistory(storedEmail));
      }
    } catch {}
  }, []);

  function showMsg(t: string, delay = 2000) {
    setMsg(t);
    setTimeout(() => setMsg(""), delay);
  }

  // ---------------- LOGIN HANDLER ----------------
  function login(e?: React.FormEvent) {
    e?.preventDefault();

    if (!email || !password) return showMsg("Enter email and password");

    if (password !== DEMO_PASSWORD) return showMsg("Wrong password");

    // save user
    localStorage.setItem("ft_current_email", email);
    localStorage.setItem("ft_current_name", name);
    setLoggedIn(true);

    if (email) setHistory(loadUserHistory(email));

    showMsg("Logged in!");
  }

  // ---------------- PROFILE SAVE ----------------
  function saveIdentity() {
    localStorage.setItem("ft_current_email", email);
    localStorage.setItem("ft_current_name", name);
    showMsg("Profile saved");
  }

  // ---------------- USER SCORE ----------------
  function addOwnScore(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email) return showMsg("Set your email first");

    if (score === "" || score === null) return showMsg("Enter score");

    const date = new Date().toISOString().slice(0, 10);

    saveTodayScore(date, email, name || undefined, Number(score));
    setScore("");
    setHistory(loadUserHistory(email));

    showMsg("Score saved!");
  }

  // ---------------- ADMIN UNLOCK ----------------
  function tryUnlockAdmin(e?: React.FormEvent) {
    e?.preventDefault();
    if (adminPass !== ADMIN_PASSWORD) return showMsg("Wrong admin password");
    setAdminUnlocked(true);
    showMsg("Admin unlocked");
    setAdminPass("");
  }

  // ---------------- ADMIN ADD SCORE ----------------
  function addOtherScore(e?: React.FormEvent) {
    e?.preventDefault();
    if (!adminUnlocked) return showMsg("Unlock admin first");

    if (!otherEmail) return showMsg("Enter email");
    if (otherScore === "" || otherScore === null) return showMsg("Enter score");

    const date = new Date().toISOString().slice(0, 10);

    saveTodayScore(date, otherEmail, otherName || undefined, Number(otherScore));
    setOtherEmail("");
    setOtherName("");
    setOtherScore("");

    showMsg("Score saved for user");
  }

  // ---------------- LOGOUT ----------------
  function logout() {
    localStorage.removeItem("ft_current_email");
    localStorage.removeItem("ft_current_name");

    setLoggedIn(false);

    setEmail("");
    setName("");
    setPassword("");
    setHistory({});
    setAdminUnlocked(false);

    showMsg("Logged out");
  }

  // -----------------------------------------
  //  IF NOT LOGGED IN → SHOW LOGIN FORM
  // -----------------------------------------
  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto space-y-4 card">
        <h2 className="text-xl font-semibold">Login</h2>

        <form onSubmit={login} className="space-y-3">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Name</label>
            <input
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-1">Password</label>
            <input
              className="input"
              type="password"
              placeholder="123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn w-full" type="submit">
            Login
          </button>
        </form>

        {msg && <div className="text-sm text-muted">{msg}</div>}
      </div>
    );
  }

  // -----------------------------------------
  //  LOGGED IN → SHOW FULL PROFILE PAGE
  // -----------------------------------------
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-1">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          <button className="btn" onClick={saveIdentity}>
            Save
          </button>
          <button className="btn bg-red-600" onClick={logout}>
            Logout
          </button>
        </div>

        {msg && <div className="text-sm text-muted mt-3">{msg}</div>}
      </div>

      {/* Add your score */}
      <section className="card">
        <h3 className="text-lg font-semibold mb-2">Add your score</h3>
        <form onSubmit={addOwnScore} className="flex gap-3">
          <input
            className="input"
            value={score}
            onChange={(e) =>
              setScore(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Score"
            type="number"
          />
          <button className="btn">Add</button>
        </form>
      </section>

      {/* Admin */}
      <section className="card">
        <h3 className="text-lg font-semibold mb-2">Admin unlock</h3>

        {!adminUnlocked ? (
          <form onSubmit={tryUnlockAdmin} className="flex gap-3">
            <input
              className="input"
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              placeholder="Admin password"
            />
            <button className="btn">Unlock</button>
          </form>
        ) : (
          <div>
            <div className="text-sm text-zinc-400 mb-2">
              Admin mode enabled
            </div>

            <form onSubmit={addOtherScore} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  className="input"
                  value={otherEmail}
                  onChange={(e) => setOtherEmail(e.target.value)}
                  placeholder="user@example.com"
                  type="email"
                />
                <input
                  className="input"
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  placeholder="Name (optional)"
                />
                <input
                  className="input"
                  value={otherScore}
                  onChange={(e) =>
                    setOtherScore(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Score"
                  type="number"
                />
              </div>

              <div className="flex gap-3">
                <button className="btn" type="submit">
                  Add for user
                </button>
                <button
                  className="btn bg-red-600"
                  type="button"
                  onClick={() => {
                    setAdminUnlocked(false);
                    showMsg("Admin locked");
                  }}
                >
                  Lock
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* History */}
      <section className="card">
        <h3 className="text-lg font-semibold mb-2">Your history</h3>

        {Object.keys(history).length === 0 ? (
          <div className="text-muted">No scores yet</div>
        ) : (
          <ul className="space-y-2">
            {Object.entries(history)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([date, s]) => (
                <li key={date} className="flex justify-between">
                  <span className="text-sm text-zinc-400">{date}</span>
                  <span className="font-semibold">{s}</span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
