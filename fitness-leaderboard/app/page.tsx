// app/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { getDailyLeaderboard, getTodayDate, saveUserScore } from "../lib/redis";
import { saveUserExercise, getDailyExercise } from "../lib/firestore";

type LeaderboardEntry = {
  userId: string;
  name: string;
  email: string;
  score: number;
};

// Mock data for today's scores
const initialScores = [
  { id: "1", name: "John Fitness", score: 85 },
  { id: "2", name: "Alice Strong", score: 92 },
];

// Mock leaderboard data
const mockLeaderboard = [
  { id: "1", position: 1, name: "Alice Strong", score: 92, avatar: "A" },
  { id: "2", position: 2, name: "John Fitness", score: 85, avatar: "J" },
  { id: "3", position: 3, name: "Michael Power", score: 78, avatar: "M" },
  { id: "4", position: 4, name: "Sarah Fit", score: 76, avatar: "S" },
  { id: "5", position: 5, name: "David Muscle", score: 70, avatar: "D" },
];

export default function HomePage() {
  const { isLoggedIn, user, loading } = useAuth();
  const [score, setScore] = useState("");
  const [todayScores, setTodayScores] = useState(initialScores);
  const todayExercise = "Lunges";
  const [todayDate, setTodayDate] = useState(getTodayDate());
const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
const [exercise, setExercise] = useState("Loading exercise...");

  
  const handleSubmitScore = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!score || !isLoggedIn || !user) return;
  
  try {
    console.log(`Submitting score for user ${user.id}, date ${todayDate}, score ${score}, exercise ${exercise}`);
    await saveUserExercise(user.id, {
  date: todayDate,
  exercise: exercise,
  score: parseInt(score)
});
    await saveUserScore(user.id, todayDate, parseInt(score), exercise);
    
    // Reload leaderboard
    const updatedLeaderboard = await getDailyLeaderboard(todayDate);
    setLeaderboard(updatedLeaderboard || []);
    
    // Display success message
    alert(`Score of ${score} for ${exercise} added successfully!`);
    
    setScore("");
  } catch (error) {
    console.error("Error submitting score:", error);
    alert("Failed to submit score. Please try again.");
  }
};

  useEffect(() => {
  async function loadData() {
    try {
      const [leaderboardData, exerciseData] = await Promise.all([
        getDailyLeaderboard(todayDate),
        getDailyExercise(todayDate)
      ]);
      
      setLeaderboard(leaderboardData || []);
      setExercise(exerciseData || "No exercise set for today");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }
  
  loadData();
}, [todayDate]);
  
  
  return (
    <div className="space-y-12 pb-12">
      {/* Hero section */}
      
      {/* Today's exercise */}
      <section className="bg-gray-800 rounded-2xl p-3 max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-sm uppercase tracking-wide text-gray-400">Today&apos;s Exercise</div>
          <h2 className="text-3xl font-bold text-red-500">{exercise}</h2>
        </div>
        
        {!loading && isLoggedIn ?  (
          <>
<form onSubmit={handleSubmitScore} className="mb-8">
  <div className="flex flex-col sm:flex-row gap-2">
    <input
      type="number"
      value={score}
      onChange={(e) => setScore(e.target.value)}
      placeholder="Enter your score"
      className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
      min="1"
      required
    />
    <button 
      type="submit"
      className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition w-full sm:w-auto"
    >
      Submit
    </button>
  </div>
</form>
            
            {/* {todayScores.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Your scores today</h3>
                <div className="space-y-2">
                  {todayScores.map((entry) => (
                    <div 
                      key={entry.id}
                      className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                    >
                      <span className="font-medium">{entry.score} points</span>
                      <button 
                        onClick={() => handleDeleteScore(entry.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
          </>
        ) : (
          <div className="text-center py-6 bg-gray-700 rounded-lg">
            <p className="mb-4 text-gray-300">Login to record your scores</p>
          </div>
        )}
      </section>
      
      {/* Leaderboard */}
      <section className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <span className="text-red-500 mr-2">⚡</span> 
          Leaderboard
        </h2>
        
        <div className="bg-gray-800 rounded-2xl overflow-hidden p-2">
          <div className="grid grid-cols-8 sm:grid-cols-12 items-center">
  <div className="col-span-2">Rank</div>
  <div className="col-span-4 sm:col-span-8">User</div>
  <div className="col-span-2 sm:col-span-3 text-right">Score</div>
</div>
          
          <div className="divide-y divide-gray-700">
            {leaderboard.map((user, index) => (
              <div 
                key={user.userId}
                className="p-4 grid grid-cols-12 items-center hover:bg-gray-700 transition"
              >
                <div className="col-span-1 font-bold text-gray-400">
                  {index+1}
                </div>
                
                <div className="col-span-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                     <div className="font-medium">{user.name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                </div>
                
                <div className="col-span-3 text-right">
                  <div className="text-xl font-bold text-red-500">{user.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}