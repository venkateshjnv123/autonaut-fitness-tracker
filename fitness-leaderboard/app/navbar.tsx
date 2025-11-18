// app/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();

  const linkClass = (href: string) =>
    `text-sm px-3 py-1 rounded ${path === href ? "bg-zinc-800" : "hover:bg-zinc-800"}`;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-md bg-orange-600 w-10 h-10 flex items-center justify-center text-black font-bold">FL</div>
            <div>
              <div className="text-lg font-semibold">Fitness Leaderboard</div>
              <div className="text-xs text-zinc-400 hidden sm:block">60-day challenge</div>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link href="/" className={linkClass("/")}>Home</Link>
            <Link href="/profile" className={linkClass("/profile")}>Profile</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
