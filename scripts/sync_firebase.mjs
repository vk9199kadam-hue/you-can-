import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCaSOwoW-rTIxZ4XcjLZtOyKD1o3TXNGRA",
  authDomain: "you-can-920e8.firebaseapp.com",
  projectId: "you-can-920e8",
  storageBucket: "you-can-920e8.firebasestorage.app",
  messagingSenderId: "408887591954",
  appId: "1:408887591954:web:66d12529db808f0ff404cb",
  measurementId: "G-E0V8DK1442"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function syncData() {
  console.log("🚀 Starting Master Firebase Sync...");

  try {
    const dbPath = path.join(__dirname, "../local_db.json");
    const rawData = fs.readFileSync(dbPath, "utf-8");
    const data = JSON.parse(rawData);
    const questions = data.questions;

    console.log(`📦 Found ${questions.length} questions in local_db.json`);

    // Firestore Batch (Max 500 operations per batch)
    const batch = writeBatch(db);
    let count = 0;

    for (const q of questions) {
      const docRef = doc(collection(db, "questions"));
      batch.set(docRef, {
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic || "General",
        question: q.question,
        options: q.options,
        answer: q.answer,
        explanation: q.explanation,
        difficulty: q.difficulty || 2,
        examType: q.exam_type || ["MHT-CET"],
        isPYQ: q.is_pyq || false,
        isShared: true,
        academyId: null, // Platform-wide
        createdAt: serverTimestamp()
      });
      count++;
      
      if (count >= 450) break; // Keep under the 500 limit for this run
    }

    console.log(`⏳ Uploading ${count} questions...`);
    await batch.commit();
    console.log("✅ Success! Data is now live in Firebase.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync Failed:", error.message);
    console.log("\nTIP: If you get a 'Permission Denied' error, you must temporarily set your Firestore Rules to 'allow write: if true;' in the Firebase Console.");
    process.exit(1);
  }
}

syncData();
