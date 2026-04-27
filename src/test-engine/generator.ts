/**
 * YOU CAN - Test Generation Engine
 */

export interface TestConfig {
  chapterId: string;
  topic?: string;
  totalQ: number;
  examMode: 'JEE' | 'MHT-CET' | 'NEET';
  diffRatio: { easy: number; medium: number; hard: number };
}

export const generateTestLogic = (pool: any[], config: TestConfig) => {
  // If pool is empty, provide mock data for the demo
  const effectivePool = pool.length > 0 ? pool : [
    { id: '1', question: 'In UCM, which of the following is constant?', options: { A: 'Velocity', B: 'Acceleration', C: 'Speed', D: 'Direction' }, answer: 'C', difficulty: 1, chapter: 'Rotational Dynamics', subject: 'Physics', exam_type: ['MHT-CET'] },
    { id: '2', question: 'The work done in a complete cycle is zero for?', options: { A: 'Non-conservative forces', B: 'Conservative forces', C: 'Friction', D: 'Viscous force' }, answer: 'B', difficulty: 2, chapter: 'Work Energy', subject: 'Physics', exam_type: ['JEE'] },
    { id: '3', question: 'The derivative of log(sin x) is:', options: { A: 'tan x', B: 'cot x', C: 'sec x', D: 'cosec x' }, answer: 'B', difficulty: 3, chapter: 'Calculus', subject: 'Maths', exam_type: ['MHT-CET'] }
  ];

  // Stratified sampling
  const easy = effectivePool.filter(q => q.difficulty <= 2);
  const medium = effectivePool.filter(q => q.difficulty > 2 && q.difficulty <= 3.5);
  const hard = effectivePool.filter(q => q.difficulty > 3.5);

  const selected = [
    ...getRandom(easy.length > 0 ? easy : effectivePool, Math.round(config.totalQ * config.diffRatio.easy)),
    ...getRandom(medium.length > 0 ? medium : effectivePool, Math.round(config.totalQ * config.diffRatio.medium)),
    ...getRandom(hard.length > 0 ? hard : effectivePool, Math.round(config.totalQ * config.diffRatio.hard))
  ].sort(() => Math.random() - 0.5);

  const marking = {
    JEE: { correct: 4, wrong: -1 },
    'MHT-CET': { correct: 1, wrong: 0 },
    NEET: { correct: 4, wrong: -1 }
  }[config.examMode];

  return { 
    questions: selected.length > 0 ? selected : effectivePool, 
    marking, 
    timeLimit: config.totalQ * 90 
  };
};

function getRandom(arr: any[], n: number) {
  return arr.sort(() => 0.5 - Math.random()).slice(0, n);
}
