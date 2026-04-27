export interface DoubtRequest {
  subject: string;
  query: string;
  image?: string;
}

export interface AIReply {
  explanation: string;
  relatedPyqs: string[];
  boardReference: string;
}

const SUBJECT_EXPLANATIONS: Record<string, string[]> = {
  Physics: [
    "Based on the Maharashtra State Board Physics syllabus, this concept relates to the fundamental principles of mechanics and thermodynamics.",
    "This is a key topic in the MHT-CET Physics section. The underlying principle follows from Newton's laws and energy conservation.",
    "According to eBalbharati Physics textbook, this concept is crucial for understanding modern physics applications.",
  ],
  Chemistry: [
    "This topic is covered in the Maharashtra Board Chemistry curriculum under physical chemistry fundamentals.",
    "Based on NCERT and eBalbharati references, this reaction mechanism follows the principles of chemical kinetics.",
    "This is an important concept for MHT-CET Chemistry. The explanation involves understanding molecular orbital theory.",
  ],
  Mathematics: [
    "This mathematical concept is fundamental to calculus and is frequently tested in MHT-CET and JEE examinations.",
    "Using standard mathematical theorems from the Maharashtra Board syllabus, we can derive this result step by step.",
    "This is a core topic in the Class 12 Mathematics curriculum, essential for competitive exam preparation.",
  ],
  Biology: [
    "This biological concept is covered extensively in the NCERT Biology textbook and is important for NEET preparation.",
    "Based on the Maharashtra Board Biology syllabus, this topic relates to fundamental life processes.",
    "This is a key concept in modern biology, frequently asked in both NEET and MHT-CET examinations.",
  ],
};

const RELATED_PYQS: Record<string, string[][]> = {
  Physics: [
    ["JEE 2023 Q12", "MHT-CET 2022 Q45", "JEE 2024 Q8"],
    ["MHT-CET 2023 Q31", "JEE 2022 Q19"],
    ["NEET 2023 Q56", "MHT-CET 2024 Q12"],
  ],
  Chemistry: [
    ["JEE 2023 Q34", "MHT-CET 2022 Q67"],
    ["MHT-CET 2023 Q42", "JEE 2024 Q15", "NEET 2023 Q23"],
    ["JEE 2022 Q28", "MHT-CET 2024 Q51"],
  ],
  Mathematics: [
    ["JEE 2023 Q5", "MHT-CET 2022 Q18"],
    ["JEE 2024 Q22", "MHT-CET 2023 Q35"],
    ["MHT-CET 2024 Q9", "JEE 2023 Q41"],
  ],
  Biology: [
    ["NEET 2023 Q15", "MHT-CET 2022 Q89"],
    ["NEET 2024 Q33", "MHT-CET 2023 Q72"],
    ["NEET 2022 Q47", "MHT-CET 2024 Q65"],
  ],
};

const REFERENCES: Record<string, string[]> = {
  Physics: [
    "Section 4.5 of eBalbharati Physics (Class 12)",
    "Chapter 7 - NCERT Physics Part II",
    "Maharashtra Board Physics Practical Manual",
  ],
  Chemistry: [
    "Section 3.2 of eBalbharati Chemistry (Class 12)",
    "Chapter 5 - NCERT Chemistry Part I",
    "Maharashtra Board Chemistry Lab Reference",
  ],
  Mathematics: [
    "Chapter 6 of eBalbharati Mathematics (Class 12)",
    "NCERT Mathematics - Differential Calculus",
    "Maharashtra Board Mathematics Formula Handbook",
  ],
  Biology: [
    "Chapter 8 of eBalbharati Biology (Class 12)",
    "NCERT Biology - Human Physiology",
    "Maharashtra Board Biology Diagram Atlas",
  ],
};

export const solveDoubt = async (request: DoubtRequest): Promise<AIReply> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const subj = request.subject in SUBJECT_EXPLANATIONS ? request.subject : "Physics";
  const idx = Math.floor(Math.random() * 3);

  const baseExplanation = SUBJECT_EXPLANATIONS[subj][idx];
  const queryContext = `Regarding your question about "${request.query}": ${baseExplanation} For detailed step-by-step solutions, refer to the textbook reference below.`;

  return {
    explanation: queryContext,
    relatedPyqs: RELATED_PYQS[subj][idx],
    boardReference: REFERENCES[subj][idx],
  };
};
