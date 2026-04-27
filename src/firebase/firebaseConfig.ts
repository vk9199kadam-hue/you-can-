// Firebase configuration for "YOU CAN" platform
// Switched from Supabase to Firebase as requested.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "you-can-platform-edu.firebaseapp.com",
  projectId: "you-can-platform-edu",
  storageBucket: "you-can-platform-edu.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
