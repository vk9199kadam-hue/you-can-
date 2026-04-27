export interface StudentStats {
  accuracy: number;
  completedChapters: number;
  totalQuestionsSolved: number;
  weakTopics: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getStudentPerformance = (_userId: string): StudentStats => {
  return {
    accuracy: 85.5,
    completedChapters: 12,
    totalQuestionsSolved: 1450,
    weakTopics: ["Rotational Dynamics", "Organic Chemistry"],
  };
};

export const trackActivity = (event: string, properties: Record<string, unknown>) => {
  console.log(`Tracking Event: ${event}`, properties);
};
