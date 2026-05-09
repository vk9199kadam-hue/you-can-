import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeworkByTeacher, getUsersByAcademy, createHomework, getDoubts, createTimetable, getTimetables, getScheduleEntries, setScheduleEntry, notifyUsers } from "../../firebase/firestore";
import type { HomeworkAssignment, UserProfile, DoubtSession, Timetable, ScheduleEntry } from "../../types";
import { AppShell, Pill } from "../../ui/layout/AppShell";
import { NotificationBell } from "../NotificationBell";
import { Card } from "../../ui/components/Card";
import { Button } from "../../ui/components/Button";
import { Input, Label, Select } from "../../ui/components/Form";

type Tab = "dashboard" | "assign" | "review" | "timetable" | "doubts";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [doubts, setDoubts] = useState<DoubtSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTimetables] = useState<Timetable[]>([]);
  const [activeTimetable, setActiveTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);

  // Assign HW form
  const [hwForm, setHwForm] = useState({ batch: "Morning Batch", subject: user?.subject || "Physics", chapter: "", topic: "", questionCount: 10, deadline: "", timeLimit: 0 });
  const [hwMsg, setHwMsg] = useState("");

  const refreshData = async () => {
    setLoading(true);
    const [hw, studs, dts] = await Promise.all([
      getHomeworkByTeacher(user!.uid),
      getUsersByAcademy(user!.academyId, "student"),
      getDoubts(user!.academyId),
    ]);
    setHomework(hw);
    setStudents(studs);
    setDoubts(dts);
    setLoading(false);
  };

  const refreshTimetable = async (opts?: { month?: number; year?: number }) => {
    if (!user?.academyId || !user?.uid) return;
    const now = new Date();
    const month = opts?.month ?? now.getMonth() + 1;
    const year = opts?.year ?? now.getFullYear();

    const tts = await getTimetables(user.academyId, user.uid);
    setTimetables(tts);

    const existing = tts.find((t) => t.month === month && t.year === year) ?? null;
    if (!existing) {
      setActiveTimetable(null);
      setEntries([]);
      return;
    }
    setActiveTimetable(existing);
    const es = await getScheduleEntries(existing.id);
    setEntries(es);
  };

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      const [hw, studs, dts] = await Promise.all([
        getHomeworkByTeacher(user.uid),
        getUsersByAcademy(user.academyId, "student"),
        getDoubts(user.academyId),
      ]);
      if (!cancelled) { setHomework(hw); setStudents(studs); setDoubts(dts); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, user?.academyId]);

  useEffect(() => {
    if (!user?.uid) return;
    refreshTimetable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.academyId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHomework({
        academyId: user!.academyId,
        teacherId: user!.uid,
        teacherName: user!.name,
        batch: hwForm.batch,
        classLevel: "Class 12",
        subject: hwForm.subject,
        chapter: hwForm.chapter,
        topic: hwForm.topic || undefined,
        questionIds: [],
        questionCount: hwForm.questionCount,
        deadline: new Date(hwForm.deadline),
        timeLimit: hwForm.timeLimit || undefined,
        showSolutionsAfterDeadline: true,
        allowLateSubmission: false,
        status: "published",
      });
      const studs = await getUsersByAcademy(user!.academyId, "student");
      const dl = new Date(hwForm.deadline).toLocaleString();
      await notifyUsers(
        studs.map((s) => ({
          userId: s.uid,
          academyId: user!.academyId,
          title: "New homework assigned",
          message: `${hwForm.subject}: ${hwForm.chapter}${hwForm.topic ? ` · ${hwForm.topic}` : ""} — ${hwForm.questionCount} questions. Due: ${dl}`,
          type: "homework",
        })),
      );
      setHwMsg("Homework published successfully!");
      setHwForm({ ...hwForm, chapter: "", topic: "" });
      refreshData();
    } catch (err) {
      setHwMsg("Error: " + (err instanceof Error ? err.message : "Failed"));
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "assign", label: "Assign HW", icon: "assignment" },
    { id: "review", label: "Review", icon: "rate_review" },
    { id: "timetable", label: "Timetable", icon: "calendar_month" },
    { id: "doubts", label: "Doubts", icon: "help_outline" },
  ];

  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [entryForm, setEntryForm] = useState<{
    date: string;
    chapterId: string;
    topicName: string;
    priorityLevel: ScheduleEntry["priorityLevel"];
  }>({ date: "", chapterId: "", topicName: "", priorityLevel: "recommended" });
  const [ttMsg, setTtMsg] = useState("");

  const createMonthlyTimetable = async () => {
    if (!user?.academyId || !user?.uid) return;
    setTtMsg("");
    try {
      const id = await createTimetable({
        academyId: user.academyId,
        teacherId: user.uid,
        classId: user.classLevel || "Class 12",
        subject: user.subject || "Physics",
        month: calMonth,
        year: calYear,
        status: "draft",
      });
      await refreshTimetable({ month: calMonth, year: calYear });
      setTtMsg(`Timetable created (${id.slice(0, 6)}…).`);
    } catch (err) {
      setTtMsg("Error: " + (err instanceof Error ? err.message : "Failed"));
    }
  };

  const addEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTimetable || !user?.academyId) return;
    setTtMsg("");
    try {
      const id = crypto.randomUUID();
      await setScheduleEntry(id, {
        timetableId: activeTimetable.id,
        academyId: user.academyId,
        date: entryForm.date,
        chapterId: entryForm.chapterId || "",
        topicName: entryForm.topicName,
        priorityLevel: entryForm.priorityLevel,
        status: "pending",
        completionRate: 0,
      });
      setEntryForm({ date: "", chapterId: "", topicName: "", priorityLevel: "recommended" });
      await refreshTimetable({ month: calMonth, year: calYear });
      setTtMsg("Entry added.");
    } catch (err) {
      setTtMsg("Error: " + (err instanceof Error ? err.message : "Failed"));
    }
  };

  const renderBody = () => {
    if (tab === "dashboard") {
      return (
        <div>
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">
            Good Morning, {user?.name}
          </h1>
          <p className="text-sm text-text-dim mb-7">
            {user?.academyName} · {user?.subject || "All Subjects"} · {students.length} Students
          </p>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "Students", value: students.length, color: "#1E40AF", icon: "👨‍🎓" },
              { label: "HW Assigned", value: homework.length, color: "#10B981", icon: "📝" },
              { label: "Open Doubts", value: doubts.filter((d) => d.status === "open").length, color: "#EF4444", icon: "❓" },
              { label: "Published", value: homework.filter((h) => h.status === "published").length, color: "#F59E0B", icon: "📋" },
            ].map((s) => (
              <Card key={s.label} className="p-5" style={{ borderLeft: `4px solid ${s.color}` }}>
                <div className="text-[28px] font-extrabold brand" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-[13px] text-text-dim font-medium">{s.label}</div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <Card className="p-6">
              <h3 className="font-bold text-base mb-4 brand">Recent Homework</h3>
              {homework.length === 0 ? (
                <p className="text-sm text-text-dim">No homework created yet.</p>
              ) : (
                <div className="space-y-3">
                  {homework.slice(0, 5).map((hw) => (
                    <div key={hw.id} className="flex items-center justify-between p-3 bg-bg border border-border rounded-lg">
                      <div>
                        <div className="font-semibold text-sm">{hw.chapter || hw.subject}</div>
                        <div className="text-xs text-text-dim">{hw.batch} · {hw.questionCount} Qs</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.status === "published" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                        {hw.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-base mb-4 brand">Open Doubts</h3>
              {doubts.length === 0 ? (
                <p className="text-sm text-text-dim">No student doubts yet.</p>
              ) : (
                <div className="space-y-3">
                  {doubts.filter((d) => d.status === "open").slice(0, 5).map((d) => (
                    <div key={d.id} className="p-3 bg-bg border border-border rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-sm">{d.studentName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.priority === "urgent" ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#FFFBEB] text-[#D97706]"}`}>
                          {d.priority}
                        </span>
                      </div>
                      <div className="text-xs text-text-dim">{d.subject} · {d.topic}</div>
                      <div className="text-sm mt-1 text-text truncate">{d.question}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex gap-3 mt-6">
            <Button onClick={() => setTab("assign")} leftIcon={<span className="material-icons-outlined">add</span>}>
              Assign Homework
            </Button>
            <Button onClick={() => setTab("review")} variant="outline">
              Review Submissions
            </Button>
          </div>
        </div>
      );
    }

    if (tab === "assign") {
      return (
        <div>
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Assign Homework</h1>
          <p className="text-sm text-text-dim mb-7">Create and publish homework for your batch</p>
          <Card className="p-8 max-w-2xl">
            <form onSubmit={handleAssign}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label>Batch</Label>
                  <Select value={hwForm.batch} onChange={(e) => setHwForm({ ...hwForm, batch: e.target.value })}>
                    <option>Morning Batch</option>
                    <option>Evening Batch</option>
                    <option>Weekend Batch</option>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={hwForm.subject} onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })}>
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                    <option>Biology</option>
                  </Select>
                </div>
                <div>
                  <Label>Chapter</Label>
                  <Input value={hwForm.chapter} onChange={(e) => setHwForm({ ...hwForm, chapter: e.target.value })} required placeholder="e.g. Electrostatics" />
                </div>
                <div>
                  <Label>Topic (Optional)</Label>
                  <Input value={hwForm.topic} onChange={(e) => setHwForm({ ...hwForm, topic: e.target.value })} placeholder="e.g. Coulomb's Law" />
                </div>
                <div>
                  <Label>Number of Questions</Label>
                  <Input type="number" min="1" max="50" value={hwForm.questionCount} onChange={(e) => setHwForm({ ...hwForm, questionCount: parseInt(e.target.value) })} />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input type="datetime-local" value={hwForm.deadline} onChange={(e) => setHwForm({ ...hwForm, deadline: e.target.value })} required />
                </div>
              </div>
              {hwMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${hwMsg.includes("Error") ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#ECFDF5] text-[#059669]"}`}>
                  {hwMsg}
                </div>
              )}
              <Button type="submit">Publish Homework</Button>
            </form>
          </Card>
        </div>
      );
    }

    if (tab === "review") {
      return (
        <div>
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Review Submissions</h1>
          <p className="text-sm text-text-dim mb-7">Review and grade student homework submissions</p>
          {homework.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-text-dim">No homework to review. Assign homework first.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {homework.map((hw) => (
                <Card key={hw.id} className="p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold text-base">{hw.chapter || hw.subject} Homework</div>
                      <div className="text-xs text-text-dim">
                        {hw.batch} · {hw.questionCount} Qs · Deadline: {hw.deadline.toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.status === "published" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                      {hw.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (tab === "timetable") {
      return (
        <div>
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Monthly Timetable</h1>
          <p className="text-sm text-text-dim mb-7">Plan topics for the month (Essential / Recommended / Optional)</p>

          <div className="flex items-end gap-3 mb-5">
            <div className="w-32">
              <Label>Month</Label>
              <Select
                value={String(calMonth)}
                onChange={(e) => {
                  const m = parseInt(e.target.value);
                  setCalMonth(m);
                  refreshTimetable({ month: m, year: calYear });
                }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-32">
              <Label>Year</Label>
              <Input
                type="number"
                value={calYear}
                onChange={(e) => {
                  const y = parseInt(e.target.value);
                  setCalYear(y);
                  refreshTimetable({ month: calMonth, year: y });
                }}
              />
            </div>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => refreshTimetable({ month: calMonth, year: calYear })}>
              Refresh
            </Button>
            <Button onClick={createMonthlyTimetable} disabled={!!activeTimetable}>
              {activeTimetable ? "Timetable exists" : "Create timetable"}
            </Button>
          </div>

          {ttMsg ? (
            <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${ttMsg.startsWith("Error") ? "bg-[#FEF2F2] text-error" : "bg-[#ECFDF5] text-[#059669]"}`}>
              {ttMsg}
            </div>
          ) : null}

          {!activeTimetable ? (
            <Card className="p-8">
              <div className="font-bold text-base brand mb-1">No timetable for this month</div>
              <p className="text-sm text-text-dim">Click “Create timetable” to start planning.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              <Card className="p-6 col-span-1">
                <div className="font-bold text-base brand mb-1">Add Topic</div>
                <p className="text-[13px] text-text-dim mb-4">Add an entry to a specific date.</p>
                <form onSubmit={addEntry} className="space-y-3">
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Topic</Label>
                    <Input value={entryForm.topicName} onChange={(e) => setEntryForm({ ...entryForm, topicName: e.target.value })} required placeholder="e.g. Gauss's Law" />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={entryForm.priorityLevel} onChange={(e) => setEntryForm({ ...entryForm, priorityLevel: e.target.value as ScheduleEntry["priorityLevel"] })}>
                      <option value="essential">Essential</option>
                      <option value="recommended">Recommended</option>
                      <option value="optional">Optional</option>
                    </Select>
                  </div>
                  <Button type="submit">Add entry</Button>
                </form>
              </Card>

              <Card className="p-6 col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-base brand">Planned Topics</div>
                    <div className="text-[13px] text-text-dim">
                      {user?.classLevel || "Class 12"} · {user?.subject || "Subject"} · {calMonth}/{calYear}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="px-2 py-1 rounded-full bg-[#FEF2F2] text-error border border-[#FCA5A5]">Essential</span>
                    <span className="px-2 py-1 rounded-full bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">Recommended</span>
                    <span className="px-2 py-1 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">Optional</span>
                  </div>
                </div>

                {entries.length === 0 ? (
                  <p className="text-sm text-text-dim">No entries yet.</p>
                ) : (
                  <div className="space-y-2">
                    {entries
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
          )}
        </div>
      );
    }

    // doubts
    return (
      <div>
        <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Doubt Room</h1>
        <p className="text-sm text-text-dim mb-7">{doubts.filter((d) => d.status === "open").length} open doubts from students</p>
        {doubts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-text-dim">No student doubts yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {doubts.map((d) => (
              <Card key={d.id} className="p-5">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-sm">{d.studentName[0]}</div>
                    <div>
                      <div className="font-semibold text-sm">{d.studentName}</div>
                      <div className="text-xs text-text-dim">{d.subject} · {d.topic}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${d.status === "open" ? "bg-[#FEF2F2] text-[#EF4444]" : d.status === "ai_resolved" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
                    {d.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-text bg-bg border border-border p-3 rounded-lg">{d.question}</p>
                {d.aiResponse ? (
                  <div className="mt-2 text-sm text-[#6B7280] bg-[#EFF6FF] p-3 rounded-lg border border-[#DBEAFE]">
                    <span className="text-xs font-bold text-[#1E40AF]">AI Response: </span>
                    {d.aiResponse}
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppShell
      topPill={<Pill tone="info">Teacher</Pill>}
      title="Teacher"
      subtitle={user ? `${user.academyName} · ${user.subject || "All Subjects"}` : undefined}
      navItems={tabs}
      activeNavId={tab}
      onNavChange={(id) => setTab(id as Tab)}
      userLabel={user ? `${user.name} · ${user.academyName}` : undefined}
      onLogout={logout}
      headerActions={user?.uid ? <NotificationBell userId={user.uid} /> : null}
    >
      {loading ? <div className="text-center text-text-dim py-20">Loading...</div> : renderBody()}
    </AppShell>
  );
}
