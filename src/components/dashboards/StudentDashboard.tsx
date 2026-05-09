import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeworkByAcademy, getTestsByStudent, getDoubts, createDoubt, getTimetables, getScheduleEntries } from "../../firebase/firestore";
import { fetchQuestions } from "../../services/dataService";
import { generateTestLogic } from "../../test-engine/generator";
import type { HomeworkAssignment, TestSession, DoubtSession } from "../../types";
import type { ScheduleEntry, Timetable } from "../../types";
import type { Question } from "../../services/dataService";
import TestRunner from "../TestRunner";
import TestResults from "../TestResults";
import SyllabusSelector from "../SyllabusSelector";
import { AppShell, Pill } from "../../ui/layout/AppShell";
import { Card } from "../../ui/components/Card";
import { Button } from "../../ui/components/Button";
import { Select, Textarea } from "../../ui/components/Form";

type Tab = "dashboard" | "homework" | "test" | "results" | "timetable" | "doubts" | "progress";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [testHistory, setTestHistory] = useState<TestSession[]>([]);
  const [doubts, setDoubts] = useState<DoubtSession[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [ttEntries, setTtEntries] = useState<ScheduleEntry[]>([]);

  // Test state
  const [currentTest, setCurrentTest] = useState<{ questions: Question[]; marking: { correct: number; wrong: number }; timeLimit: number } | null>(null);
  const [testResults, setTestResults] = useState<{ questions: Question[]; answers: Record<string, string> } | null>(null);

  // Doubt form
  const [doubtText, setDoubtText] = useState("");
  const [doubtSubject, setDoubtSubject] = useState("Physics");

  const refreshData = async () => {
    setLoading(true);
    const [hw, qs, dts] = await Promise.all([
      user?.academyId ? getHomeworkByAcademy(user.academyId) : Promise.resolve([]),
      fetchQuestions(),
      user?.academyId ? getDoubts(user.academyId, { studentId: user.uid }) : Promise.resolve([]),
    ]);
    if (user?.uid) {
      try { const th = await getTestsByStudent(user.uid); setTestHistory(th); } catch { setTestHistory([]); }
    }
    setHomework(hw);
    setQuestions(qs);
    setDoubts(dts);
    setLoading(false);
  };

  const refreshTimetable = async () => {
    if (!user?.academyId) return;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const all = await getTimetables(user.academyId);
    const match =
      all.find((t: Timetable) => t.month === month && t.year === year && t.classId === (user.classLevel || "Class 12")) ??
      all.find((t: Timetable) => t.month === month && t.year === year) ??
      null;
    if (!match) {
      setTtEntries([]);
      return;
    }
    const es = await getScheduleEntries(match.id);
    setTtEntries(es);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [hw, qs, dts] = await Promise.all([
        user?.academyId ? getHomeworkByAcademy(user.academyId) : Promise.resolve([]),
        fetchQuestions(),
        user?.academyId ? getDoubts(user.academyId, { studentId: user.uid }) : Promise.resolve([]),
      ]);
      if (user?.uid) {
        try { const th = await getTestsByStudent(user.uid); if (!cancelled) setTestHistory(th); } catch { if (!cancelled) setTestHistory([]); }
      }
      if (!cancelled) { setHomework(hw); setQuestions(qs); setDoubts(dts); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, user?.academyId]);

  useEffect(() => {
    refreshTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.academyId]);

  const handleStartTest = (selection: { class: string; subject: string; chapter: string; topic: string }) => {
    const testData = generateTestLogic(questions, {
      chapterId: selection.chapter,
      topic: selection.topic,
      totalQ: 10,
      examMode: "MHT-CET",
      diffRatio: { easy: 0.4, medium: 0.4, hard: 0.2 },
    });
    setCurrentTest(testData);
    setTab("test");
  };

  const handleFinishTest = (testQuestions: Question[], answers: Record<string, string>) => {
    setTestResults({ questions: testQuestions, answers });
    setTab("results");
  };

  const handleSubmitDoubt = async () => {
    if (!doubtText.trim()) return;
    await createDoubt({
      studentId: user!.uid,
      studentName: user!.name,
      academyId: user!.academyId,
      subject: doubtSubject,
      chapter: "",
      topic: "",
      question: doubtText,
      status: "open",
      priority: "normal",
      createdAt: new Date(),
    });
    setDoubtText("");
    refreshData();
  };

  if (tab === "test" && currentTest) {
    return <TestRunner testData={currentTest} onFinish={handleFinishTest} />;
  }

  if (tab === "results" && testResults) {
    return <TestResults questions={testResults.questions} answers={testResults.answers} onBackHome={() => setTab("dashboard")} onRetake={() => setTab("test")} />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "homework", label: "Homework", icon: "assignment" },
    { id: "test", label: "Practice", icon: "quiz" },
    { id: "timetable", label: "Timetable", icon: "calendar_month" },
    { id: "doubts", label: "Doubts", icon: "help_outline" },
    { id: "progress", label: "Progress", icon: "trending_up" },
  ];

  return (
    <AppShell
      topPill={<Pill tone="success">{user?.academyName || "Academy"}</Pill>}
      title="Student"
      subtitle={user ? `${user.classLevel || "Class 12"} ${user.stream || "PCM"}` : undefined}
      navItems={tabs}
      activeNavId={tab}
      onNavChange={(id) => setTab(id as Tab)}
      userLabel={user?.name}
      onLogout={logout}
    >
      {loading ? (
        <div className="text-center text-text-dim py-20">Loading...</div>
      ) : tab === "dashboard" ? (
        <div>
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Hello, {user?.name}!</h1>
          <p className="text-sm text-text-dim mb-7">{user?.classLevel || "Class 12"} {user?.stream || "PCM"} · {user?.academyName}</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Questions Solved", value: testHistory.reduce((sum, t) => sum + t.totalQuestions, 0), color: "#1E40AF" },
                  { label: "Tests Taken", value: testHistory.length, color: "#10B981" },
                  { label: "Pending HW", value: homework.filter(h => h.status === "published").length, color: "#EF4444" },
                  { label: "Open Doubts", value: doubts.filter(d => d.status === "open").length, color: "#F59E0B" },
                ].map((s) => (
                  <Card key={s.label} className="p-5" style={{ borderLeft: `4px solid ${s.color}` }}>
                    <div className="text-[28px] font-extrabold brand" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-[13px] text-text-dim font-medium">{s.label}</div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Card className="p-6">
                  <h3 className="font-bold text-base mb-4 brand">Homework</h3>
                  {homework.length === 0 ? <p className="text-sm text-text-dim">No homework assigned yet.</p> : (
                    <div className="space-y-3">
                      {homework.slice(0, 5).map((hw) => (
                        <div key={hw.id} className="flex items-center justify-between p-3 rounded-lg" style={{ borderLeft: "4px solid #EF4444", background: "#F9FAFB" }}>
                          <div><div className="font-semibold text-sm">{hw.chapter || hw.subject}</div><div className="text-xs text-[#6B7280]">{hw.questionCount} Qs · {hw.teacherName}</div></div>
                          <div className="text-xs font-semibold text-[#EF4444]">{hw.deadline.toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold text-base mb-4 brand">Recent Tests</h3>
                  {testHistory.length === 0 ? <p className="text-sm text-text-dim">No tests taken yet. Start practicing!</p> : (
                    <div className="space-y-3">
                      {testHistory.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                          <div className="w-11 h-11 rounded-lg flex items-center justify-center font-extrabold text-sm" style={{ background: t.score / t.totalQuestions >= 0.7 ? "#ECFDF5" : "#FFFBEB", color: t.score / t.totalQuestions >= 0.7 ? "#059669" : "#D97706" }}>
                            {Math.round((t.score / t.totalQuestions) * 100)}%
                          </div>
                          <div><div className="font-semibold text-sm">{t.subject} · {t.chapter}</div><div className="text-xs text-[#6B7280]">{t.score}/{t.totalQuestions} correct</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setTab("test")} leftIcon={<span className="material-icons-outlined">play_arrow</span>}>
                  Start Practice
                </Button>
                <Button onClick={() => setTab("homework")} variant="outline">View Homework</Button>
                <Button onClick={() => setTab("doubts")} variant="outline">Ask a Doubt</Button>
              </div>
            </div>
          ) : tab === "homework" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">My Homework</h1>
              <p className="text-sm text-text-dim mb-7">{homework.length} assignments</p>
              {homework.length === 0 ? (
                <Card className="p-12 text-center"><p className="text-text-dim">No homework assigned yet.</p></Card>
              ) : (
                <div className="space-y-4">
                  {homework.map((hw) => (
                    <Card key={hw.id} className="p-5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-base">{hw.chapter || hw.subject}</div>
                        <div className="text-xs text-[#6B7280]">{hw.subject} · {hw.questionCount} Qs · by {hw.teacherName}</div>
                        <div className="text-xs text-[#6B7280] mt-1">Deadline: {hw.deadline.toLocaleDateString()}</div>
                      </div>
                      <Button size="sm">Start</Button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : tab === "test" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Practice Test</h1>
              <p className="text-sm text-text-dim mb-7">Select your subject and chapter</p>
              <SyllabusSelector onStartTest={handleStartTest} />
            </div>
          ) : tab === "timetable" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">This Month’s Timetable</h1>
              <p className="text-sm text-text-dim mb-7">Follow essential topics first, then recommended practice.</p>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[13px] text-text-dim">
                    {user?.classLevel || "Class 12"} · {user?.stream || "PCM"} · {new Date().toLocaleString(undefined, { month: "long", year: "numeric" })}
                  </div>
                  <Button variant="outline" onClick={refreshTimetable}>Refresh</Button>
                </div>

                {ttEntries.length === 0 ? (
                  <p className="text-sm text-text-dim">No timetable published for this month yet.</p>
                ) : (
                  <div className="space-y-2">
                    {ttEntries
                      .slice()
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map((en) => (
                        <div key={en.id} className="p-3 rounded-lg border border-border bg-bg flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{en.topicName}</div>
                            <div className="text-xs text-text-dim">{en.date}</div>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              en.priorityLevel === "essential"
                                ? "bg-[#FEF2F2] text-error border-[#FCA5A5]"
                                : en.priorityLevel === "recommended"
                                  ? "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]"
                                  : "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                            }`}
                          >
                            {en.priorityLevel}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          ) : tab === "doubts" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Ask a Doubt</h1>
              <p className="text-sm text-text-dim mb-7">Submit your question and get help</p>

              <Card className="p-6 mb-6">
                <div className="flex gap-3 mb-4">
                  <Select value={doubtSubject} onChange={(e) => setDoubtSubject(e.target.value)} className="w-36">
                    <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
                  </Select>
                  <Textarea value={doubtText} onChange={(e) => setDoubtText(e.target.value)} placeholder="Type your doubt here..." className="flex-1 resize-none" rows={2} />
                  <Button onClick={handleSubmitDoubt} className="self-end">Send</Button>
                </div>
              </Card>

              {doubts.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-base" style={{ fontFamily: "Outfit, sans-serif" }}>Your Doubts</h3>
                  {doubts.map((d) => (
                    <div key={d.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF]">{d.subject}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${d.status === "open" ? "bg-[#FFFBEB] text-[#D97706]" : "bg-[#ECFDF5] text-[#059669]"}`}>{d.status.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm text-[#1F2937] mb-2">{d.question}</p>
                      {d.aiResponse && <div className="text-sm bg-[#EFF6FF] p-3 rounded-lg border border-[#DBEAFE]"><span className="text-xs font-bold text-[#1E40AF] block mb-1">AI Response</span>{d.aiResponse}</div>}
                      {d.teacherResponse && <div className="text-sm bg-[#ECFDF5] p-3 rounded-lg border border-[#A7F3D0] mt-2"><span className="text-xs font-bold text-[#059669] block mb-1">Teacher Response</span>{d.teacherResponse}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Your Progress</h1>
              <p className="text-sm text-text-dim mb-7">Track your preparation journey</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Tests Taken", value: testHistory.length, color: "#1E40AF" },
                  { label: "Questions Solved", value: testHistory.reduce((s, t) => s + t.totalQuestions, 0), color: "#10B981" },
                  { label: "Avg Score", value: testHistory.length > 0 ? Math.round(testHistory.reduce((s, t) => s + (t.score / t.totalQuestions) * 100, 0) / testHistory.length) + "%" : "—", color: "#3B82F6" },
                  { label: "Doubts Asked", value: doubts.length, color: "#F59E0B" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <div className="text-[28px] font-extrabold" style={{ color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                    <div className="text-[13px] text-[#6B7280] font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="font-bold text-base mb-4 brand">Test History</h3>
                {testHistory.length === 0 ? <p className="text-sm text-text-dim">No tests taken yet. Start a practice test to see your progress!</p> : (
                  <div className="space-y-3">
                    {testHistory.map((t) => (
                      <div key={t.id} className="flex items-center gap-4 p-3 bg-[#F9FAFB] rounded-lg">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center font-extrabold text-sm" style={{ background: t.score / t.totalQuestions >= 0.7 ? "#ECFDF5" : t.score / t.totalQuestions >= 0.4 ? "#FFFBEB" : "#FEF2F2", color: t.score / t.totalQuestions >= 0.7 ? "#059669" : t.score / t.totalQuestions >= 0.4 ? "#D97706" : "#EF4444" }}>
                          {Math.round((t.score / t.totalQuestions) * 100)}%
                        </div>
                        <div className="flex-1"><div className="font-semibold text-sm">{t.subject} · {t.chapter}</div><div className="text-xs text-[#6B7280]">{t.score}/{t.totalQuestions} correct · {t.examMode}</div></div>
                        <span className="text-xs text-[#6B7280]">{t.completedAt.toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
    </AppShell>
  );
}
