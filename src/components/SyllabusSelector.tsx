import { useState } from "react";
import { SYLLABUS_DATA } from "../data/syllabus";

interface SyllabusSelection {
  class: string;
  subject: string;
  chapter: string;
  topic: string;
}

export default function SyllabusSelector({
  onStartTest,
}: {
  onStartTest: (selection: SyllabusSelection) => void;
}) {
  const [selection, setSelection] = useState<SyllabusSelection>({
    class: "Class 12",
    subject: "",
    chapter: "",
    topic: "",
  });

  const classes = Object.keys(SYLLABUS_DATA);
  const subjects = selection.class
    ? Object.keys(SYLLABUS_DATA[selection.class])
    : [];
  const chapters =
    selection.class && selection.subject
      ? Object.keys(SYLLABUS_DATA[selection.class][selection.subject])
      : [];
  const topics =
    selection.class && selection.subject && selection.chapter
      ? SYLLABUS_DATA[selection.class][selection.subject][selection.chapter]
      : [];

  return (
    <div className="glass-card p-10 animate-fade-in max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 gradient-text">
        Test Preparation Engine
      </h2>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Academic Year
            </label>
            <select
              className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
              value={selection.class}
              onChange={(e) =>
                setSelection({
                  ...selection,
                  class: e.target.value,
                  subject: "",
                  chapter: "",
                  topic: "",
                })
              }
            >
              {classes.map((c) => (
                <option key={c} value={c} className="bg-bg">
                  {c} (2025-26)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Subject Stream
            </label>
            <select
              className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
              value={selection.subject}
              onChange={(e) =>
                setSelection({
                  ...selection,
                  subject: e.target.value,
                  chapter: "",
                  topic: "",
                })
              }
            >
              <option value="" className="bg-bg">
                Select Subject
              </option>
              {subjects.map((s) => (
                <option key={s} value={s} className="bg-bg">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selection.subject && (
          <div className="grid grid-cols-2 gap-6 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                Target Chapter
              </label>
              <select
                className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
                value={selection.chapter}
                onChange={(e) =>
                  setSelection({
                    ...selection,
                    chapter: e.target.value,
                    topic: "",
                  })
                }
              >
                <option value="" className="bg-bg">
                  Select Chapter
                </option>
                {chapters.map((c) => (
                  <option key={c} value={c} className="bg-bg">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                Specific Concept (Topic)
              </label>
              <select
                className="w-full glass-card bg-transparent p-4 border-white/10 outline-none hover:border-primary/50 transition-all cursor-pointer"
                value={selection.topic}
                onChange={(e) =>
                  setSelection({ ...selection, topic: e.target.value })
                }
              >
                <option value="" className="bg-bg">
                  All Topics
                </option>
                {topics.map((t) => (
                  <option key={t} value={t} className="bg-bg">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 flex justify-between items-center">
        <p className="text-sm text-text-dim">
          Selection:{" "}
          <span className="text-white font-bold">
            {selection.subject || "..."}
          </span>{" "}
          /{" "}
          <span className="text-white">{selection.chapter || "..."}</span>
        </p>
        <button
          disabled={!selection.chapter}
          onClick={() => onStartTest(selection)}
          className={`btn-premium px-12 py-4 ${
            !selection.chapter
              ? "opacity-50 cursor-not-allowed grayscale"
              : ""
          }`}
        >
          Start Test &rarr;
        </button>
      </div>
    </div>
  );
}
