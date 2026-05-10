import json
import os
import glob
import re

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DB = os.path.join(SCRIPT_DIR, "local_db.json")
CONTENT_DIR = os.path.join(SCRIPT_DIR, "external_sources", "content")

# Smart Mapping Dictionary
MAPPING = {
    "Physics": ["rotational", "fluid", "thermo", "oscillation", "wave", "electro", "magnetic", "induction", "optics", "atom", "nuclei", "semiconductor", "motion", "force", "gravitation", "work", "energy"],
    "Chemistry": ["solid state", "solution", "electrochem", "kinetics", "surface", "block", "coordination", "organic", "aldehyde", "ketone", "acid", "amine", "biomolecule", "polymer", "mole", "atomic", "periodic", "bond"],
    "Mathematics": ["relation", "function", "trig", "matrix", "determinant", "diff", "integral", "vector", "3d", "probability", "linear", "set", "complex", "binomial", "sequence"],
    "Biology": ["reproduction", "inheritance", "evolution", "health", "disease", "microbe", "biotech", "organism", "population", "ecosystem", "biodiversity", "cell", "plant", "animal"]
}

def resolve_subject(text, current_subject="General"):
    text = text.lower()
    for subject, keywords in MAPPING.items():
        for kw in keywords:
            if kw in text:
                return subject
    return current_subject

def load_db():
    try:
        if os.path.exists(LOCAL_DB):
            with open(LOCAL_DB, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"questions": []}
    except Exception as e:
        print(f"Error loading DB: {e}")
        return {"questions": []}

def save_db(data):
    try:
        with open(LOCAL_DB, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving DB: {e}")

def ingest_all():
    db = load_db()
    print("Starting Smart Master Ingestion...")

    existing_questions = {q.get("question", "")[:100] for q in db.get("questions", [])}
    new_count = 0

    # Search all folders in external_sources/content
    json_files = glob.glob(os.path.join(CONTENT_DIR, "**/*.json"), recursive=True)
    
    print(f"Found {len(json_files)} potential data files.")

    for file_path in json_files:
        if any(x in file_path for x in ["node_modules", "package.json", "tsconfig", "dist"]):
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                items = data if isinstance(data, list) else [data]

                for q in items:
                    if not isinstance(q, dict) or "question" not in q:
                        continue
                    
                    q_text = q.get("question", "")
                    if q_text[:100] in existing_questions:
                        continue

                    # Smart Resolve
                    subject = resolve_subject(q_text + " " + q.get("chapter", "") + " " + q.get("topic", ""), q.get("subject", "General"))
                    
                    normalized_q = {
                        "id": str(len(db["questions"]) + 1),
                        "subject": subject,
                        "chapter": q.get("chapter", "Uncategorized"),
                        "topic": q.get("topic", "General"),
                        "exam_type": q.get("exam_type", ["JEE", "MHT-CET"]),
                        "question": q_text,
                        "options": q.get("options", {}),
                        "answer": q.get("answer", ""),
                        "explanation": q.get("explanation", ""),
                        "is_pyq": q.get("is_pyq", True),
                        "difficulty": q.get("difficulty", 3),
                    }
                    
                    db["questions"].append(normalized_q)
                    existing_questions.add(q_text[:100])
                    new_count += 1
                    
                    if new_count >= 1000: # Batch limit for safety
                        break
        except Exception:
            continue
        
        if new_count >= 1000:
            break

    print(f"Ingestion Complete! Added {new_count} new questions.")
    print(f"Total Database Size: {len(db['questions'])} questions.")
    save_db(db)

if __name__ == "__main__":
    ingest_all()
