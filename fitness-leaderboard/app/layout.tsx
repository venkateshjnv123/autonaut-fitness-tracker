// app/layout.tsx
import "./globals.css";
import Navbar from "./navbar";

export const metadata = {
  title: "Fitness Leaderboard",
  description: "Simple frontend-only leaderboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white font-sans">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
