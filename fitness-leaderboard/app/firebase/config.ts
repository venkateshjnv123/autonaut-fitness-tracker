// app/firebase/config.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBFka7-9NfwKec0nQzrAsUhIKGImJWbst0",
  authDomain: "autonaut-fitness-8ccdb.firebaseapp.com",
  projectId: "autonaut-fitness-8ccdb",
  storageBucket: "autonaut-fitness-8ccdb.firebasestorage.app",
  messagingSenderId: "594404651248",
  appId: "1:594404651248:web:ec1b1e84207469e9521235",
  measurementId: "G-WPPSZ0STGX"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { app, auth };