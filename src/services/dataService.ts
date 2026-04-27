import jsonDB from "../../local_db.json";

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

export const fetchQuestions = async (): Promise<Question[]> => {
  console.log("Fetching questions from Local Device Database...");
  return (jsonDB as { questions: Question[] }).questions;
};

export const saveQuestion = async (question: Question): Promise<boolean> => {
  console.log("Saving locally (Simulation):", question);
  return true;
};
