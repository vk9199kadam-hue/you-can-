export const DATA_SOURCES = {
  JEE_MAINS: {
    github: "https://github.com/HostServer001/jee_mains_pyqs_data_base",
    description: "14,000+ JEE PYQs (PCM)",
    type: "Python/JSON"
  },
  NEET_BENCHMARK: {
    huggingface: "https://huggingface.co/datasets/Reja1/jee-neet-benchmark",
    description: "NEET 2024 AUTHENTIC Qs (Image-based)",
    type: "Hugging Face Parquet"
  },
  MHT_CET_MOCK: {
    github: "https://github.com/Rushi128/MHT-CET-MOCKTEST",
    description: "Maharashtra State Board Mock Exam Framework",
    type: "PHP/MySQL"
  },
  ENTRANCE_EXAM_KG: {
    kaggle: "https://www.kaggle.com/datasets/damerajee/jee-question-json-format",
    description: "Master JSON Schema for PCM/PCB",
    type: "JSON"
  }
};

export const SYLLABUS_CHAPTERS = {
  PHYSICS: ["Rotational Dynamics", "Solid State", "Thermodynamics", "Electrostatics"],
  CHEMISTRY: ["Chemical Kinetics", "p-Block Elements", "Coordination Compounds"],
  MATHS: ["Differentiation", "Integration", "Vectors", "Probability"],
  BIOLOGY: ["Genetics", "Respiration", "Human Health", "Biotechnology"]
};
