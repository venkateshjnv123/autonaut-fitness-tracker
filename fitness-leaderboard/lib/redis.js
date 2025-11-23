import { Redis } from '@upstash/redis';

// Initialize Redis client with credentials from env variables
// Using NEXT_PUBLIC_ prefix to make variables available on the client side
const redisUrl = process.env.NEXT_PUBLIC_UPSTASH_REDIS_URL;
const redisToken = process.env.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN;
// Mock Redis implementation for development when credentials are missing
class MockRedis {
  constructor() {
    this._data = {};
    console.warn('Using Mock Redis - data will not persist across page refreshes');
  }
  
  async get(key) { return this._data[key]; }
  async set(key, value) { this._data[key] = value; return 'OK'; }
  async hset(key, fields) { this._data[key] = {...(this._data[key] || {}), ...fields}; return Object.keys(fields).length; }
  async hgetall(key) { return this._data[key] || null; }
  async sadd(key, ...members) { this._data[key] = new Set([...(this._data[key] || []), ...members]); return members.length; }
  
  pipeline() { return this; }
  async exec() { return []; }
  
  async zrange(key, start, stop, options = {}) { return []; }
  async zadd(key, scoreMembers) { return 1; }
}

// Use real Redis if credentials are available, otherwise use mock
let redis;

try {
  if (!redisUrl || !redisToken) {
    console.log("Environment variables:", {
  hasUrl: process.env.UPSTASH_REDIS_URL, 
  hasToken: process.env.UPSTASH_REDIS_TOKEN
});

    console.warn('Redis credentials missing. Using mock Redis implementation.');
    console.warn('Set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in your .env.local file');
    redis = new MockRedis();
  } else {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
  redis = new MockRedis();
}


export async function saveFirebaseUser(userId, userData) {
  const { email, name } = userData;
  const now = Date.now();
  
  const pipeline = redis.pipeline();
  
  // Save user details (simplified, no photoURL)
  pipeline.hset(`user:${userId}`, {
    email,
    name: name || '',
    createdAt: now
  });
  
  // Add to users set
  pipeline.sadd('users:all', userId);
  
  // Map email to userId for lookups
  if (email) {
    pipeline.set(`user:email:${email}`, userId);
  }
  
  await pipeline.exec();
  return userId;
}

export async function getUserById(userId) {
  return redis.hgetall(`user:${userId}`);
}

export async function getUserByEmail(email) {
  const userId = await redis.get(`user:email:${email}`);
  if (!userId) return null;
  return getUserById(userId);
}

// Exercise Management
export async function setDailyExercise(date, exerciseName) {
  await redis.set(`exercise:${date}`, exerciseName);
  await redis.sadd('exercises:all', exerciseName);
  return exerciseName;
}

export async function getDailyExercise(date) {
  return redis.get(`exercise:${date}`) || 'No exercise set';
}

// Score Management
export async function saveUserScore(userId, date, score, exercise) {
  try {
    // Make sure date is properly formatted
    const validatedDate = validateDateFormat(date);
    console.log('Saving score:', { userId, date: validatedDate, score, exercise });
    
    const pipeline = redis.pipeline();
    
    // Save the user's score for this date
    console.log(`Adding score to user:${userId}:scores with date=${validatedDate}, score=${score}`);
    pipeline.hset(`user:${userId}:scores`, validatedDate, score);
    
    // Save exercise if provided
    if (exercise) {
      console.log(`Adding exercise to user:${userId}:exercises with date=${validatedDate}, exercise=${exercise}`);
      pipeline.hset(`user:${userId}:exercises`, validatedDate, exercise);
    }
    
    // Add to daily leaderboard
    console.log(`Adding to leaderboard:${validatedDate} with score=${score}, userId=${userId}`);
    pipeline.zadd(`leaderboard:${validatedDate}`, { score, member: userId });
    
    // Update all-time leaderboard (optional)
    // This would require fetching and summing all scores
    
    const results = await pipeline.exec();
    console.log('Pipeline execution results:', results);
    
    // Verify the data was saved correctly
    setTimeout(async () => {
      try {
        // Check if the score was saved to the user's history
        const userScores = await redis.hgetall(`user:${userId}:scores`);
        console.log('Verification - User scores after save:', userScores);
        
        // Check if the score was added to the leaderboard
        const leaderboardData = await redis.zrange(`leaderboard:${validatedDate}`, 0, -1, { withScores: true });
        console.log('Verification - Leaderboard after save:', leaderboardData);
        
        // Force refresh local data caches - helpful for MockRedis
        if (typeof window !== 'undefined') {
          console.log('Dispatching storage event for local data refresh');
          window.dispatchEvent(new Event('storage'));
        }
      } catch (verifyError) {
        console.error('Error during verification:', verifyError);
      }
    }, 500); // Small delay to ensure Redis operations complete
    
    return { userId, date: validatedDate, score };
  } catch (error) {
    console.error('Error in saveUserScore:', error);
    throw error;
  }
}

export async function getUserScores(userId) {
  const scores = await redis.hgetall(`user:${userId}:scores`);
  return scores || {};
}

export async function getUserExercises(userId) {
  const exercises = await redis.hgetall(`user:${userId}:exercises`);
  return exercises || {};
}

// Combined user history
export async function getUserHistory(userId) {
  try {
    console.log(`Getting history for user: ${userId}`);
    
    const [scores, exercises] = await Promise.all([
      redis.hgetall(`user:${userId}:scores`),
      redis.hgetall(`user:${userId}:exercises`)
    ]);
    
    console.log('User history data received:', { 
      hasScores: !!scores, 
      hasExercises: !!exercises,
      scores,
      exercises
    });
    
    const history = {};
    
    // Check if we actually have data
    if (!scores && !exercises) {
      console.warn(`No history data found for user ${userId}`);
      return {};
    }

    // Combine scores and exercises by date
    const allDates = new Set([
      ...Object.keys(scores || {}),
      ...Object.keys(exercises || {})
    ]);
    
    console.log('Dates found:', Array.from(allDates));
    
    // Convert to array for sorting
    const sortedDates = Array.from(allDates).sort((a, b) => {
      // Try to sort by date if possible, otherwise just use string comparison
      try {
        // For proper dates in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(a) && /^\d{4}-\d{2}-\d{2}$/.test(b)) {
          return new Date(b).getTime() - new Date(a).getTime(); // Newest first
        }
      } catch (e) {
        // Fall back to string comparison if date parsing fails
      }
      return b.localeCompare(a); // String comparison fallback
    });
    
    console.log('Sorted dates:', sortedDates);
    
    // Build history with validated dates
    for (const date of sortedDates) {
      const validatedDate = validateDateFormat(date);
      history[validatedDate] = {
        score: scores?.[date] ? parseInt(scores[date], 10) : 0,
        exercise: exercises?.[date] || null
      };
    }
    
    return history;
  } catch (error) {
    console.error(`Error fetching history for user ${userId}:`, error);
    // Return empty history object so UI doesn't break
    return {};
  }
}

// Leaderboard functions
export async function getDailyLeaderboard(date, options = {}) {
  try {
    const { limit = 10, withScores = true } = options;
    
    // Get top scores with user IDs (in reverse order to get highest scores first)
    const leaderboardData = await redis.zrange(
      `leaderboard:${date}`,
      0,
      limit - 1,
      {
        rev: true,
        withScores: withScores
      }
    );
    
    if (!withScores) return leaderboardData;
    
    // Format results with scores
    const result = [];
    
    // Handle different response formats or empty responses
    if (!Array.isArray(leaderboardData) || leaderboardData.length === 0) {
      return [];
    }
    
    // Check if we have the new format (objects with member/score)
    if (typeof leaderboardData[0] === 'object' && leaderboardData[0].member) {
      // New format: [{member: '...', score: '...'}, ...]
      for (const item of leaderboardData) {
        try {
          const userId = item.member;
          const score = parseInt(item.score, 10);
          
          // Get user details
          const user = await getUserById(userId);
          
          result.push({
            userId,
            name: user?.name || 'Unknown User',
            email: user?.email || '',
            score
          });
        } catch (itemError) {
          console.warn('Error processing leaderboard item:', itemError);
        }
      }
    } else {
      // Old format: [member1, score1, member2, score2, ...]
      for (let i = 0; i < leaderboardData.length; i += 2) {
        try {
          if (i + 1 >= leaderboardData.length) break; // Avoid index out of bounds
          
          const userId = leaderboardData[i];
          const score = parseInt(leaderboardData[i + 1], 10);
          
          // Get user details
          const user = await getUserById(userId);
          
          result.push({
            userId,
            name: user?.name || 'Unknown User',
            email: user?.email || '',
            score
          });
        } catch (itemError) {
          console.warn(`Error processing leaderboard item at index ${i}:`, itemError);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return [];
  }
}

// Utility function to validate date format, ensuring it's in YYYY-MM-DD format
function validateDateFormat(date) {
  // Check if already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  
  // Try to parse and format the date
  try {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn(`Could not parse date: ${date}`, e);
  }
  
  // If parsing fails, return the original string
  return date;
}

// Utility function to get today's date in YYYY-MM-DD format
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Combined function to handle a user activity
export async function recordUserActivity(userId, userData, date, score, exercise = null) {
  // Ensure user exists
  await saveFirebaseUser(userId, userData);
  
  // Save the score and exercise
  await saveUserScore(userId, date, score, exercise);
  
  return { userId, date, score, exercise };
}