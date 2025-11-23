// context/AuthContext.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { saveFirebaseUser, getUserByEmail } from "../../lib/redis";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "../firebase/config";
import { saveUserProfile } from "../../lib/firestore";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = user !== null;
  
  // Listen for auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    setLoading(true);
    
    if (firebaseUser) {
      // User is signed in
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        image: firebaseUser.photoURL
      };
      
      // Save user to Redis if they exist in Firebase
      try {
       await saveUserProfile(firebaseUser.uid, {
  email: firebaseUser.email,
  name: firebaseUser.displayName,
  image: firebaseUser.photoURL
});
      } catch (error) {
        console.error("Error saving user to Redis", error);
      }
      
      setUser(userData);
    } else {
      // User is signed out
      setUser(null);
    }
    
    setLoading(false);
  });
  
  // Cleanup subscription on unmount
  return () => unsubscribe();
}, []);
  
  // Google sign in
  const login = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Auth state listener will update the user
    } catch (error) {
      console.error("Error signing in with Google", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Sign out
  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      // Auth state listener will update the user
    } catch (error) {
      console.error("Error signing out", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};