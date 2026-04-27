import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCaSOwoW-rTIxZ4XcjLZtOyKD1o3TXNGRA",
  authDomain: "you-can-920e8.firebaseapp.com",
  projectId: "you-can-920e8",
  storageBucket: "you-can-920e8.firebasestorage.app",
  messagingSenderId: "408887591954",
  appId: "1:408887591954:web:66d12529db808f0ff404cb",
  measurementId: "G-E0V8DK1442",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
