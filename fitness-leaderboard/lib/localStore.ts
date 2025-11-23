// lib/localStore.ts
export type ScoreEntry = { email: string; name?: string; score: number; exercise?: string };
export type HistoryEntry = { score: number; exercise?: string };
export type UserHistory = Record<string, HistoryEntry>;

// Local cache for faster UI rendering
const cache = {
  user: null,
  history: {},
  leaderboard: {}
};

// Function to format date consistently
export function formatDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// User profile management
export async function saveUserProfile(email: string, name?: string) {
  // Save to localStorage for quick access
  localStorage.setItem("ft_current_email", email);
  if (name) localStorage.setItem("ft_current_name", name);
  
  // Send to API
  try {
    await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
  } catch (error) {
    console.error('Error saving user to API:', error);
  }
}

// Save today's score and exercise
export async function saveTodayScore(
  date: string, 
  email: string, 
  name: string | undefined, 
  score: number, 
  exercise?: string
) {
  try {
    // Send to API
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, date, score, exercise })
    });
    
    // Clear cache to ensure fresh data
    delete cache.history[email];
    delete cache.leaderboard[date];
    
    return true;
  } catch (error) {
    console.error('Error saving score to API:', error);
    return false;
  }
}

// Get user's score history
export async function loadUserHistory(email: string): Promise<UserHistory> {
  // Check cache first
  if (cache.history[email]) return cache.history[email];
  
  try {
    const response = await fetch(`/api/activity?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error('Failed to load history');
    
    const history = await response.json();
    cache.history[email] = history;
    return history;
  } catch (error) {
    console.error('Error loading user history:', error);
    return {};
  }
}

// Get today's leaderboard
export async function loadTodayLeaderboard(date = new Date().toISOString().slice(0,10)): Promise<ScoreEntry[]> {
  // Check cache first
  if (cache.leaderboard[date]) return cache.leaderboard[date];
  
  try {
    const response = await fetch(`/api/leaderboard?date=${date}`);
    if (!response.ok) throw new Error('Failed to load leaderboard');
    
    const leaderboard = await response.json();
    cache.leaderboard[date] = leaderboard;
    return leaderboard;
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

// Clear user session
export function clearUserSession() {
  localStorage.removeItem("ft_current_email");
  localStorage.removeItem("ft_current_name");
  cache.user = null;
}