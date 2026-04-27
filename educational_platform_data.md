# 📁 "YOU CAN" Platform Data Manifest (Localhost Reference)

This file contains all the "information" and "required data" for your project as requested.

## 📍 1. Structured Question Repositories (Import to Local)

| Repo Name | Content | URL |
| :--- | :--- | :--- |
| **JEE Mains PYQs** | 14,000+ Questions (PCM) | [Link](https://github.com/HostServer001/jee_mains_pyqs_data_base) |
| **NEET Benchmark** | 500+ Authentic Qs (Images) | [Link](https://huggingface.co/datasets/Reja1/jee-neet-benchmark) |
| **Entrance Dataset**| 100K+ Mixed Prep Qs | [Link](https://huggingface.co/datasets/datavorous/entrance-exam-dataset) |
| **MHT-CET Mock** | Board specific logic | [Link](https://github.com/Rushi128/MHT-CET-MOCKTEST) |

## 📐 2. Unified Database Schema (SQL)

Run this on your local Postgres/Supabase instance to create the question compartment.

```sql
CREATE TABLE quest_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam TEXT[] DEFAULT '{MHT-CET}',
    subject VARCHAR(50),
    chapter VARCHAR(255),
    stream VARCHAR(10),
    question_html TEXT,
    options JSONB,
    correct_ans CHAR(1),
    explanation_html TEXT,
    difficulty INT DEFAULT 3,
    is_pyq BOOLEAN DEFAULT true,
    year INT
);

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    event_type VARCHAR(100),
    properties JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 3. Local Test Data (JSON Sample)

You can use this to test your frontend `App.tsx` logic locally.

```json
[
  {
    "id": "q_001",
    "subject": "Physics",
    "chapter": "Electrostatics",
    "exam": ["JEE", "MHT-CET"],
    "question": "What is the force between two charges of 1C separated by 1m?",
    "options": {
      "A": "9x10^9 N",
      "B": "1 N",
      "C": "8.85x10^-12 N",
      "D": "Zero"
    },
    "answer": "A"
  }
]
```
