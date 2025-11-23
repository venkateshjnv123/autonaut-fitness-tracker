// lib/firestore.js
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from '../app/firebase/config';

// Initialize Firestore
const db = getFirestore(app);

// User Profile Operations
export async function saveUserProfile(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // New user - create profile
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      // Existing user - update profile
      await updateDoc(userRef, {
        ...userData,
        lastLogin: serverTimestamp(),
      });
    }
    
    return userId;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return { id: userId, ...userDoc.data() };
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    console.error('Error finding user by email in Firestore:', error);
    throw error;
  }
}

// Exercise and Score Operations
export async function saveUserExercise(userId, { date, exercise, score }) {
  try {
    // Create a document ID based on date for easy retrieval
    const exerciseRef = doc(db, 'users', userId, 'exercises', date);
    
    // Add timestamp
    const dataToSave = {
      date,
      exercise,
      score,
      timestamp: serverTimestamp(),
    };
    
    await setDoc(exerciseRef, dataToSave);
    
    return { date, exercise, score };
  } catch (error) {
    console.error('Error saving exercise to Firestore:', error);
    throw error;
  }
}

export async function getUserExerciseHistory(userId) {
  try {
    const exercisesRef = collection(db, 'users', userId, 'exercises');
    const querySnapshot = await getDocs(exercisesRef);
    
    const history = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history[data.date] = data;
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching exercise history from Firestore:', error);
    return {};
  }
}

// Exercise Management Functions
export async function setDailyExercise(date, exerciseName) {
  try {
    const exerciseRef = doc(db, 'exercises', date);
    
    await setDoc(exerciseRef, {
      date,
      name: exerciseName,
      timestamp: serverTimestamp()
    });
    
    return { date, name: exerciseName };
  } catch (error) {
    console.error('Error setting daily exercise in Firestore:', error);
    throw error;
  }
}

export async function getDailyExercise(date) {
  try {
    if (!date) {
      console.warn('getDailyExercise called without a date');
      return 'No date specified';
    }
    
    console.log(`Fetching exercise for date: ${date}`);
    const exerciseRef = doc(db, 'exercises', date);
    const exerciseDoc = await getDoc(exerciseRef);
    
    if (!exerciseDoc.exists()) {
      console.log(`No exercise found for date: ${date}`);
      return 'No exercise set for today';
    }
    
    const data = exerciseDoc.data();
    console.log('Exercise data retrieved:', data);
    
    // Check if the data has the expected structure
    if (!data.name) {
      console.warn('Exercise document missing name field:', data);
      return data.exercise || 'Exercise format error';
    }
    
    return data.name;
  } catch (error) {
    console.error('Error getting daily exercise from Firestore:', error);
    return 'Error loading exercise';
  }
}

// Migration functions
export async function migrateUserFromRedis(userId, redisUserData, redisScores, redisExercises) {
  try {
    // 1. Migrate user profile
    await saveUserProfile(userId, {
      id: userId,
      name: redisUserData.name || null,
      email: redisUserData.email || null,
    });
    
    // 2. Migrate exercise history
    const validDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    
    // Get all dates from both scores and exercises
    const allDates = new Set([
      ...Object.keys(redisScores || {}),
      ...Object.keys(redisExercises || {})
    ]);
    
    // Filter valid dates
    const validDates = Array.from(allDates).filter(date => validDatePattern.test(date));
    
    // Migrate each exercise entry
    for (const date of validDates) {
      const score = redisScores?.[date] ? parseInt(redisScores[date], 10) : 0;
      const exercise = redisExercises?.[date] || 'Unknown Exercise';
      
      await saveUserExercise(userId, {
        date,
        exercise,
        score
      });
    }
    
    console.log(`Successfully migrated user ${userId} from Redis to Firestore`);
  } catch (error) {
    console.error(`Error migrating user ${userId} from Redis to Firestore:`, error);
    throw error;
  }
}