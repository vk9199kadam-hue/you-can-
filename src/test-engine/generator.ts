import type { Question } from "../services/dataService";

export interface TestConfig {
  chapterId: string;
  topic?: string;
  totalQ: number;
  examMode: "JEE" | "MHT-CET" | "NEET";
  diffRatio: { easy: number; medium: number; hard: number };
}

const FALLBACK_QUESTIONS: Question[] = [
  {
    id: "fallback-1",
    question: "In UCM, which of the following is constant?",
    options: {
      A: "Velocity",
      B: "Acceleration",
      C: "Speed",
      D: "Direction",
    },
    answer: "C",
    difficulty: 1,
    chapter: "Rotational Dynamics",
    subject: "Physics",
    exam_type: ["MHT-CET"],
    is_pyq: false,
    topic: "Centripetal Force",
  },
  {
    id: "fallback-2",
    question: "The work done in a complete cycle is zero for?",
    options: {
      A: "Non-conservative forces",
      B: "Conservative forces",
      C: "Friction",
      D: "Viscous force",
    },
    answer: "B",
    difficulty: 2,
    chapter: "Work Energy",
    subject: "Physics",
    exam_type: ["JEE"],
    is_pyq: false,
    topic: "Conservation of Energy",
  },
  {
    id: "fallback-3",
    question: "The derivative of log(sin x) is:",
    options: { A: "tan x", B: "cot x", C: "sec x", D: "cosec x" },
    answer: "B",
    difficulty: 3,
    chapter: "Calculus",
    subject: "Mathematics",
    exam_type: ["MHT-CET"],
    is_pyq: false,
    topic: "Differentiation",
  },
];

export const generateTestLogic = (pool: Question[], config: TestConfig) => {
  const effectivePool =
    pool.length > 0 ? pool : FALLBACK_QUESTIONS;

  const easy = effectivePool.filter((q) => q.difficulty <= 2);
  const medium = effectivePool.filter(
    (q) => q.difficulty > 2 && q.difficulty <= 3.5
  );
  const hard = effectivePool.filter((q) => q.difficulty > 3.5);

  const selected = [
    ...getRandom(
      easy.length > 0 ? easy : effectivePool,
      Math.round(config.totalQ * config.diffRatio.easy)
    ),
    ...getRandom(
      medium.length > 0 ? medium : effectivePool,
      Math.round(config.totalQ * config.diffRatio.medium)
    ),
    ...getRandom(
      hard.length > 0 ? hard : effectivePool,
      Math.round(config.totalQ * config.diffRatio.hard)
    ),
  ].sort(() => Math.random() - 0.5);

  const marking = {
    JEE: { correct: 4, wrong: -1 },
    "MHT-CET": { correct: 1, wrong: 0 },
    NEET: { correct: 4, wrong: -1 },
  }[config.examMode];

  return {
    questions: selected.length > 0 ? selected : effectivePool,
    marking,
    timeLimit: config.totalQ * 90,
  };
};

function getRandom(arr: Question[], n: number): Question[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
}
