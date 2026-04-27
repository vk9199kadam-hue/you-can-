/**
 * Data Service for "YOU CAN" Platform
 * Handles Local JSON and Firebase Firestore operations.
 */

import jsonDB from '../../local_db.json';

export type Question = {
  id: string;
  subject: string;
  chapter: string;
  exam_type: string[];
  question: string;
  options: { [key: string]: string };
  answer: string;
  explanation?: string;
  is_pyq: boolean;
  difficulty: number;
  topic: string;
};

// Current Mode: Local Development
const USE_FIREBASE = false;

export const fetchQuestions = async (): Promise<Question[]> => {
  if (!USE_FIREBASE) {
    // Return from local_db.json on the student's device
    console.log("Fetching questions from Local Device Database...");
    return (jsonDB as any).questions as Question[];
  }
  
  // Logic for Firebase Firestore would go here
  return [];
};

export const saveQuestion = async (question: Question) => {
  if (!USE_FIREBASE) {
     console.log("Saving locally (Simulation):", question);
     return true;
  }
  return false;
};
