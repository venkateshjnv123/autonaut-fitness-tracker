// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { getUserHistory } from "../../lib/redis";
import { getUserExerciseHistory } from "../../lib/firestore";


export default function ProfilePage() {
  const { user, isLoggedIn, logout, loading } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history, setHistory] = useState<any>({});

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, router, loading]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!loading && isLoggedIn && user?.id) {
        try {
          const userHistory = await getUserExerciseHistory(user.id);
          setHistory(userHistory || {});
        } catch (error) {
          console.error("Error loading history:", error);
        }
      }
    };
    
    fetchHistory();
  }, [user, loading, isLoggedIn]);

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }
  
  if (!isLoggedIn) {
    return;
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        {user?.image ? (
          <Image 
            src={user.image} 
            alt={user.name || "User"} 
            width={64} 
            height={64} 
            className="rounded-full"
            unoptimized // Add this if you get domain errors with Google profile pics
          />
        ) : (
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user?.name?.charAt(0) || "?"}
            </span>
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold">{user?.name || "User"}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-2xl overflow-hidden mb-8">
  <div className="bg-gray-700 p-4 flex justify-between items-center">
    <h2 className="text-xl font-bold">Your Fitness History</h2>
    <button 
      onClick={async () => {
  if (user?.id) {
    try {
      const userHistory = await getUserExerciseHistory(user.id);
      setHistory(userHistory || {});
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }
}}
      className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
    >
      Refresh History
    </button>
  </div>
  
  {Object.keys(history).length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Exercise
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Score
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {Object.entries(history)
            .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(([date, entry]: [string, any]) => (
              <tr key={date} className="hover:bg-gray-700 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  {date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {entry.exercise || <span className="text-gray-400 italic">Not recorded</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-xl font-bold text-red-500">
                  {entry.score || 0}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="p-6 text-center text-gray-400">
      No history yet. Start adding scores!
    </div>
  )}
</div>

      
      <div className="text-center">
        <button
          onClick={logout}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}