import json
import os
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOCAL_DB = os.path.join(SCRIPT_DIR, "local_db.json")
CONTENT_DIR = os.path.join(SCRIPT_DIR, "external_sources", "content")


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

    print("Starting Deep Data Ingestion...")

    existing_questions = {q.get("question", "") for q in db.get("questions", [])}
    new_count = 0

    json_files = glob.glob(os.path.join(CONTENT_DIR, "**/*.json"), recursive=True)

    for file_path in json_files:
        if "node_modules" in file_path or "package.json" in file_path or "tsconfig" in file_path:
            continue

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

                if isinstance(data, list):
                    for q in data:
                        if isinstance(q, dict) and "question" in q:
                            if q["question"] not in existing_questions:
                                normalized_q = {
                                    "id": str(len(db["questions"]) + 1),
                                    "subject": q.get("subject", "General"),
                                    "chapter": q.get("chapter", "Uncategorized"),
                                    "exam_type": q.get("exam_type", ["JEE"]),
                                    "question": q.get("question", ""),
                                    "options": q.get("options", {}),
                                    "answer": q.get("answer", ""),
                                    "explanation": q.get("explanation", ""),
                                    "is_pyq": q.get("is_pyq", False),
                                    "difficulty": q.get("difficulty", 3),
                                    "topic": q.get("topic", "General Concept"),
                                }
                                db["questions"].append(normalized_q)
                                existing_questions.add(q["question"])
                                new_count += 1

                elif isinstance(data, dict) and "question" in data:
                    if data["question"] not in existing_questions:
                        db["questions"].append(data)
                        existing_questions.add(data["question"])
                        new_count += 1
        except Exception:
            continue

    print(f"Ingestion Complete! Added {new_count} new questions.")
    print(f"Total Repository Size: {len(db['questions'])} active questions.")
    save_db(db)


if __name__ == "__main__":
    ingest_all()
