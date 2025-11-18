// app/login/page.tsx
"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      {session ? (
        <div className="bg-zinc-900 p-6 rounded text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center font-bold text-black">
              {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{session.user?.name}</div>
              <div className="text-sm text-zinc-400">{session.user?.email}</div>
            </div>
          </div>

          <div className="mt-4">
            <button className="btn bg-red-600 hover:bg-red-700" onClick={() => signOut({ callbackUrl: "/" })}>Sign out</button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded shadow">
          <p className="mb-4 text-sm text-zinc-600">Sign in with Google to access your profile and add scores.</p>
          <button
            className="btn bg-blue-600 hover:bg-blue-700"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
