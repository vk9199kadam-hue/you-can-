import { useState } from "react";
import type { Question } from "../services/dataService";

interface TestResultsProps {
  questions: Question[];
  answers: Record<string, string>;
  onBackHome: () => void;
  onRetake: () => void;
}

export default function TestResults({
  questions,
  answers,
  onBackHome,
  onRetake,
}: TestResultsProps) {
  const [showReview, setShowReview] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);

  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  const wrong = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== q.answer
  ).length;
  const unattempted = questions.filter((q) => !answers[q.id]).length;
  const accuracy = questions.length > 0 ? (correct / questions.length) * 100 : 0;

  const subjectBreakdown: Record<
    string,
    { correct: number; total: number }
  > = {};
  for (const q of questions) {
    if (!subjectBreakdown[q.subject]) {
      subjectBreakdown[q.subject] = { correct: 0, total: 0 };
    }
    subjectBreakdown[q.subject].total++;
    if (answers[q.id] === q.answer) {
      subjectBreakdown[q.subject].correct++;
    }
  }

  if (showReview) {
    const q = questions[reviewIdx];
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.answer;
    const isUnattempted = !userAnswer;

    return (
      <div className="min-h-screen bg-[#050505] p-8 text-white relative overflow-hidden">
        <div className="grid-bg"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setShowReview(false)}
              className="glass-card px-6 py-3 hover:bg-white/10 transition-all font-bold text-sm"
            >
              &larr; Back to Results
            </button>
            <span className="text-text-dim text-sm">
              Question {reviewIdx + 1} of {questions.length}
            </span>
          </div>

          <div className="glass-card p-10">
            <div className="flex items-center gap-4 mb-8">
              <span
                className={`text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                  isUnattempted
                    ? "text-yellow-400 border-yellow-400/40"
                    : isCorrect
                    ? "text-secondary border-secondary/40"
                    : "text-accent border-accent/40"
                }`}
              >
                {isUnattempted ? "Skipped" : isCorrect ? "Correct" : "Wrong"}
              </span>
              <span className="text-text-dim text-xs uppercase tracking-widest">
                {q.subject} &bull; {q.chapter}
              </span>
            </div>

            <h3 className="text-2xl font-bold leading-relaxed mb-10 border-l-4 border-primary pl-8">
              {q.question}
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {Object.entries(q.options).map(([key, val]) => {
                const isAnswer = key === q.answer;
                const isUserPick = key === userAnswer;
                let borderColor = "border-white/10 bg-white/5";
                if (isAnswer)
                  borderColor =
                    "border-secondary bg-secondary/10 border-2";
                else if (isUserPick && !isCorrect)
                  borderColor = "border-accent bg-accent/10 border-2";

                return (
                  <div
                    key={key}
                    className={`p-6 rounded-2xl border ${borderColor} transition-all`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isAnswer
                            ? "bg-secondary text-white"
                            : isUserPick
                            ? "bg-accent text-white"
                            : "bg-white/10 text-primary"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="font-medium">{val}</span>
                      {isAnswer && (
                        <span className="ml-auto text-secondary text-xs font-bold">
                          Correct Answer
                        </span>
                      )}
                      {isUserPick && !isCorrect && (
                        <span className="ml-auto text-accent text-xs font-bold">
                          Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {q.explanation && (
              <div className="glass-card p-6 bg-primary/5 border-primary/20">
                <h4 className="text-primary font-bold text-xs uppercase tracking-widest mb-3">
                  Explanation
                </h4>
                <p className="text-text-dim leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={() => setReviewIdx((p) => Math.max(0, p - 1))}
              disabled={reviewIdx === 0}
              className={`flex-1 py-4 glass-card font-bold tracking-widest text-sm ${
                reviewIdx === 0
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-white/10"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setReviewIdx((p) =>
                  Math.min(questions.length - 1, p + 1)
                )
              }
              disabled={reviewIdx === questions.length - 1}
              className={`flex-1 py-4 btn-premium font-bold tracking-widest text-sm ${
                reviewIdx === questions.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] p-8 text-white relative overflow-hidden">
      <div className="grid-bg"></div>

      <div className="max-w-4xl mx-auto relative z-10 pt-16">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-secondary text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Test Complete
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
            Your <span className="gradient-text">Results</span>
          </h1>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12 animate-fade-in">
          <div className="glass-card p-8 text-center">
            <p className="text-5xl font-black gradient-text mb-2">
              {accuracy.toFixed(0)}%
            </p>
            <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
              Accuracy
            </p>
          </div>
          <div className="glass-card p-8 text-center bg-secondary/5 border-secondary/20">
            <p className="text-5xl font-black text-secondary mb-2">
              {correct}
            </p>
            <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
              Correct
            </p>
          </div>
          <div className="glass-card p-8 text-center bg-accent/5 border-accent/20">
            <p className="text-5xl font-black text-accent mb-2">{wrong}</p>
            <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
              Wrong
            </p>
          </div>
          <div className="glass-card p-8 text-center">
            <p className="text-5xl font-black text-yellow-400 mb-2">
              {unattempted}
            </p>
            <p className="text-text-dim text-xs uppercase tracking-widest font-bold">
              Skipped
            </p>
          </div>
        </div>

        <div className="glass-card p-10 mb-12 animate-fade-in">
          <h3 className="text-xl font-bold mb-8">Subject Breakdown</h3>
          <div className="space-y-6">
            {Object.entries(subjectBreakdown).map(([subject, data]) => {
              const pct =
                data.total > 0
                  ? (data.correct / data.total) * 100
                  : 0;
              return (
                <div key={subject}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">{subject}</span>
                    <span className="text-text-dim text-sm">
                      {data.correct}/{data.total} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${pct}%`,
                        background:
                          pct >= 70
                            ? "#10B981"
                            : pct >= 40
                            ? "#F59E0B"
                            : "#F43F5E",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-10 mb-12 animate-fade-in">
          <h3 className="text-xl font-bold mb-6">Question Navigator</h3>
          <div className="grid grid-cols-10 gap-3">
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const isRight = userAns === q.answer;
              const isSkipped = !userAns;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setReviewIdx(i);
                    setShowReview(true);
                  }}
                  className={`h-11 rounded-xl flex items-center justify-center cursor-pointer font-bold text-sm border transition-all hover:scale-110 ${
                    isSkipped
                      ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400"
                      : isRight
                      ? "bg-secondary/20 border-secondary text-secondary"
                      : "bg-accent/20 border-accent text-accent"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex gap-6 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              Correct
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              Wrong
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              Skipped
            </div>
          </div>
        </div>

        <div className="flex gap-6 animate-fade-in">
          <button
            onClick={() => {
              setReviewIdx(0);
              setShowReview(true);
            }}
            className="flex-1 py-5 glass-card hover:bg-white/10 transition-all font-bold tracking-widest text-sm"
          >
            Review Answers
          </button>
          <button
            onClick={onRetake}
            className="flex-1 py-5 glass-card border-primary/30 hover:bg-primary/5 transition-all font-bold tracking-widest text-sm text-primary"
          >
            Retake Test
          </button>
          <button
            onClick={onBackHome}
            className="flex-1 py-5 btn-premium font-bold tracking-widest text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
