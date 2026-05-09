import jsonDB from "../../local_db.json";
import type { QuestionDoc } from "../types";

export type Question = {
  id: string;
  subject: string;
  chapter: string;
  exam_type: string[];
  question: string;
  options: Record<string, string>;
  answer: string;
  explanation?: string;
  is_pyq: boolean;
  difficulty: number;
  topic: string;
};

function questionDocToQuestion(d: QuestionDoc): Question {
  return {
    id: d.id,
    subject: d.subject,
    chapter: d.chapter,
    topic: d.topic ?? "",
    exam_type: d.examType ?? [],
    question: d.question,
    options: d.options,
    answer: d.answer,
    explanation: d.explanation,
    is_pyq: d.isPYQ ?? false,
    difficulty: d.difficulty ?? 3,
  };
}

/**
 * Loads questions from Firestore (shared + academy) when available; falls back to bundled local_db.json.
 */
export const fetchQuestions = async (academyId?: string | null): Promise<Question[]> => {
  try {
    const { getQuestions } = await import("../firebase/firestore");
    const remote = await getQuestions(academyId ? { academyId } : {});
    if (remote.length > 0) {
      return remote.map(questionDocToQuestion);
    }
  } catch (e) {
    console.warn("Firestore question bank unavailable, using local JSON fallback.", e);
  }
  return (jsonDB as { questions: Question[] }).questions;
};

export const saveQuestion = async (question: Question): Promise<boolean> => {
  console.log("Saving locally (Simulation):", question);
  return true;
};
