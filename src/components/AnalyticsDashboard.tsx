import { useState } from "react";
import { getStudentPerformance } from "../analytics/dashboard";
import type { Question } from "../services/dataService";

interface AnalyticsDashboardProps {
  questions: Question[];
  testHistory: TestRecord[];
}

export interface TestRecord {
  id: string;
  date: Date;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  subjects: string[];
  timeTaken: number;
}

export default function AnalyticsDashboard({
  questions,
  testHistory,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "history">("overview");
  const stats = getStudentPerformance("student-1");

  const subjectCounts: Record<string, number> = {};
  for (const q of questions) {
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
  }

  const examCounts: Record<string, number> = {};
  for (const q of questions) {
    for (const exam of q.exam_type) {
      examCounts[exam] = (examCounts[exam] || 0) + 1;
    }
  }

  const totalTests = testHistory.length;
  const avgAccuracy =
    totalTests > 0
      ? testHistory.reduce(
          (sum, t) =>
            sum +
            (t.totalQuestions > 0
              ? (t.correct / t.totalQuestions) * 100
              : 0),
          0
        ) / totalTests
      : 0;

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          Performance Analytics
        </div>
        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
          Your <span className="gradient-text">Progress</span>
        </h2>
        <p className="text-text-dim text-lg">
          Track your preparation across all subjects
        </p>
      </div>

      <div className="flex gap-2 mb-8 justify-center">
        {(["overview", "subjects", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-primary text-white"
                : "glass-card text-text-dim hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-card p-8 text-center">
              <p className="text-4xl font-black gradient-text mb-2">
                {stats.accuracy}%
              </p>
              <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
                Overall Accuracy
              </p>
            </div>
            <div className="glass-card p-8 text-center">
              <p className="text-4xl font-black text-secondary mb-2">
                {stats.completedChapters}
              </p>
              <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
                Chapters Done
              </p>
            </div>
            <div className="glass-card p-8 text-center">
              <p className="text-4xl font-black text-primary mb-2">
                {stats.totalQuestionsSolved}
              </p>
              <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
                Questions Solved
              </p>
            </div>
            <div className="glass-card p-8 text-center">
              <p className="text-4xl font-black text-yellow-400 mb-2">
                {totalTests}
              </p>
              <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
                Tests Taken
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold mb-6">Weak Topics</h3>
              <div className="space-y-4">
                {stats.weakTopics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 glass-card p-4 bg-accent/5 border-accent/20"
                  >
                    <span className="text-accent font-bold text-lg">
                      !
                    </span>
                    <span className="font-medium">{topic}</span>
                    <button className="ml-auto text-xs text-primary font-bold hover:underline">
                      Practice Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-8">
              <h3 className="text-lg font-bold mb-6">
                Question Bank Coverage
              </h3>
              <div className="space-y-4">
                {Object.entries(examCounts).map(([exam, count]) => (
                  <div
                    key={exam}
                    className="flex items-center justify-between"
                  >
                    <span className="font-bold">{exam}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (count / questions.length) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-text-dim text-sm">
                        {count} Qs
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {totalTests > 0 && (
            <div className="glass-card p-8">
              <h3 className="text-lg font-bold mb-6">
                Average Test Performance
              </h3>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-black gradient-text">
                    {avgAccuracy.toFixed(1)}%
                  </p>
                  <p className="text-text-dim text-xs uppercase tracking-widest mt-1">
                    Avg Accuracy
                  </p>
                </div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${avgAccuracy}%`,
                      background:
                        avgAccuracy >= 70
                          ? "#10B981"
                          : avgAccuracy >= 40
                          ? "#F59E0B"
                          : "#F43F5E",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(subjectCounts).map(([subject, count]) => (
            <div key={subject} className="glass-card p-8 group hover:border-primary/50 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{subject}</h3>
                  <p className="text-text-dim text-sm mt-1">
                    {count} questions available
                  </p>
                </div>
                <div className="text-4xl">
                  {subject === "Physics"
                    ? "⚛️"
                    : subject === "Chemistry"
                    ? "🧪"
                    : subject === "Mathematics"
                    ? "📐"
                    : "🧬"}
                </div>
              </div>

              <div className="space-y-3">
                {questions
                  .filter((q) => q.subject === subject)
                  .reduce((chapters: string[], q) => {
                    if (!chapters.includes(q.chapter))
                      chapters.push(q.chapter);
                    return chapters;
                  }, [])
                  .slice(0, 5)
                  .map((chapter) => (
                    <div
                      key={chapter}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-text-dim">{chapter}</span>
                      <span className="text-primary font-bold">
                        {
                          questions.filter(
                            (q) =>
                              q.subject === subject &&
                              q.chapter === chapter
                          ).length
                        }{" "}
                        Qs
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {testHistory.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-xl font-bold mb-4">No tests yet</h3>
              <p className="text-text-dim">
                Take your first test to see your history here
              </p>
            </div>
          ) : (
            testHistory.map((test) => {
              const accuracy =
                test.totalQuestions > 0
                  ? (test.correct / test.totalQuestions) * 100
                  : 0;
              return (
                <div
                  key={test.id}
                  className="glass-card p-6 flex items-center gap-6 hover:border-primary/50 transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${
                      accuracy >= 70
                        ? "bg-secondary/20 text-secondary"
                        : accuracy >= 40
                        ? "bg-yellow-400/20 text-yellow-400"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {accuracy.toFixed(0)}%
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">
                      {test.subjects.join(", ")} Test
                    </p>
                    <p className="text-text-dim text-sm">
                      {test.correct}/{test.totalQuestions} correct &bull;{" "}
                      {test.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-text-dim">
                      {Math.floor(test.timeTaken / 60)}m{" "}
                      {test.timeTaken % 60}s
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
