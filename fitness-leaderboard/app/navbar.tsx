// app/navbar.tsx
"use client";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, login, logout, loading } = useAuth();
  
  return (
    <header className="bg-black text-white">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="font-bold text-white">AF</span>
            </div>
            <Link href="/" className="text-xl font-bold text-white">
              Autonaut Fitness
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-red-400 transition">
              Home
            </Link>
            
            {loading ? (
              <div className="px-4 py-2 bg-gray-600 text-white rounded opacity-70">
                Loading...
              </div>
            ) : isLoggedIn ? (
              <Link href="/profile" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                Profile
              </Link>
            ) : (
              <button 
                onClick={login} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}