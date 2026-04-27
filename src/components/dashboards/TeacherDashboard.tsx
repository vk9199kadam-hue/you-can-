import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getHomeworkByTeacher, getUsersByAcademy, createHomework, getDoubts } from "../../firebase/firestore";
import type { HomeworkAssignment, UserProfile, DoubtSession } from "../../types";

type Tab = "dashboard" | "assign" | "review" | "doubts";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [doubts, setDoubts] = useState<DoubtSession[]>([]);
  const [loading, setLoading] = useState(true);

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
    { id: "doubts", label: "Doubts", icon: "help_outline" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center font-extrabold text-sm text-white">Y</div>
          <span className="font-bold text-[15px] text-[#1F2937]" style={{ fontFamily: "Outfit, sans-serif" }}>YOU CAN</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] font-semibold ml-2">Teacher</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B7280]">{user?.name} · {user?.academyName}</span>
          <button onClick={logout} className="text-sm text-[#EF4444] font-semibold hover:underline">Logout</button>
        </div>
      </header>

      <div className="flex">
        <nav className="w-60 bg-white border-r border-[#E5E7EB] min-h-[calc(100vh-56px)] p-3 sticky top-14">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition ${tab === t.id ? "bg-[#EFF6FF] text-[#1E40AF]" : "text-[#6B7280] hover:bg-[#F9FAFB]"}`}>
              <span className="material-icons-outlined text-xl">{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-8 max-w-[1100px]">
          {loading ? (
            <div className="text-center text-[#6B7280] py-20">Loading...</div>
          ) : tab === "dashboard" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Teacher Panel</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Good Morning, {user?.name}</h1>
              <p className="text-sm text-[#6B7280] mb-7">{user?.academyName} · {user?.subject || "All Subjects"} · {students.length} Students</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Students", value: students.length, color: "#1E40AF", icon: "👨‍🎓" },
                  { label: "HW Assigned", value: homework.length, color: "#10B981", icon: "📝" },
                  { label: "Open Doubts", value: doubts.filter(d => d.status === "open").length, color: "#EF4444", icon: "❓" },
                  { label: "Published", value: homework.filter(h => h.status === "published").length, color: "#F59E0B", icon: "📋" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm" style={{ borderLeft: `4px solid ${s.color}` }}>
                    <div className="text-[28px] font-extrabold" style={{ color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                    <div className="text-[13px] text-[#6B7280] font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Recent Homework</h3>
                  {homework.length === 0 ? <p className="text-sm text-[#6B7280]">No homework created yet.</p> : (
                    <div className="space-y-3">
                      {homework.slice(0, 5).map((hw) => (
                        <div key={hw.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                          <div><div className="font-semibold text-sm">{hw.chapter || hw.subject}</div><div className="text-xs text-[#6B7280]">{hw.batch} · {hw.questionCount} Qs</div></div>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.status === "published" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{hw.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Open Doubts</h3>
                  {doubts.length === 0 ? <p className="text-sm text-[#6B7280]">No student doubts yet.</p> : (
                    <div className="space-y-3">
                      {doubts.filter(d => d.status === "open").slice(0, 5).map((d) => (
                        <div key={d.id} className="p-3 bg-[#F9FAFB] rounded-lg">
                          <div className="flex justify-between mb-1"><span className="font-semibold text-sm">{d.studentName}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.priority === "urgent" ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#FFFBEB] text-[#D97706]"}`}>{d.priority}</span></div>
                          <div className="text-xs text-[#6B7280]">{d.subject} · {d.topic}</div>
                          <div className="text-sm mt-1 text-[#1F2937] truncate">{d.question}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setTab("assign")} className="px-5 py-2.5 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition text-sm flex items-center gap-2"><span className="material-icons-outlined text-lg">add</span>Assign Homework</button>
                <button onClick={() => setTab("review")} className="px-5 py-2.5 bg-white text-[#1F2937] border border-[#E5E7EB] font-semibold rounded-lg hover:bg-[#F9FAFB] transition text-sm">Review Submissions</button>
              </div>
            </div>
          ) : tab === "assign" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Teacher Panel</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Assign Homework</h1>
              <p className="text-sm text-[#6B7280] mb-7">Create and publish homework for your batch</p>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm max-w-2xl">
                <form onSubmit={handleAssign}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Batch</label>
                      <select value={hwForm.batch} onChange={(e) => setHwForm({ ...hwForm, batch: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition">
                        <option>Morning Batch</option><option>Evening Batch</option><option>Weekend Batch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Subject</label>
                      <select value={hwForm.subject} onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })} className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition">
                        <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Chapter</label>
                      <input value={hwForm.chapter} onChange={(e) => setHwForm({ ...hwForm, chapter: e.target.value })} required placeholder="e.g. Electrostatics" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Topic (Optional)</label>
                      <input value={hwForm.topic} onChange={(e) => setHwForm({ ...hwForm, topic: e.target.value })} placeholder="e.g. Coulomb's Law" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Number of Questions</label>
                      <input type="number" min="1" max="50" value={hwForm.questionCount} onChange={(e) => setHwForm({ ...hwForm, questionCount: parseInt(e.target.value) })} className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Deadline</label>
                      <input type="datetime-local" value={hwForm.deadline} onChange={(e) => setHwForm({ ...hwForm, deadline: e.target.value })} required className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition" />
                    </div>
                  </div>
                  {hwMsg && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${hwMsg.includes("Error") ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#ECFDF5] text-[#059669]"}`}>{hwMsg}</div>}
                  <button type="submit" className="px-6 py-2.5 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition text-sm">Publish Homework</button>
                </form>
              </div>
            </div>
          ) : tab === "review" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Teacher Panel</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Review Submissions</h1>
              <p className="text-sm text-[#6B7280] mb-7">Review and grade student homework submissions</p>
              {homework.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center"><p className="text-[#6B7280]">No homework to review. Assign homework first.</p></div>
              ) : (
                <div className="space-y-4">
                  {homework.map((hw) => (
                    <div key={hw.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-base">{hw.chapter || hw.subject} Homework</div>
                          <div className="text-xs text-[#6B7280]">{hw.batch} · {hw.questionCount} Qs · Deadline: {hw.deadline.toLocaleDateString()}</div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.status === "published" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{hw.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Teacher Panel</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Doubt Room</h1>
              <p className="text-sm text-[#6B7280] mb-7">{doubts.filter(d => d.status === "open").length} open doubts from students</p>
              {doubts.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center"><p className="text-[#6B7280]">No student doubts yet.</p></div>
              ) : (
                <div className="space-y-4">
                  {doubts.map((d) => (
                    <div key={d.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-sm">{d.studentName[0]}</div>
                          <div><div className="font-semibold text-sm">{d.studentName}</div><div className="text-xs text-[#6B7280]">{d.subject} · {d.topic}</div></div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${d.status === "open" ? "bg-[#FEF2F2] text-[#EF4444]" : d.status === "ai_resolved" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{d.status.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm text-[#1F2937] bg-[#F9FAFB] p-3 rounded-lg">{d.question}</p>
                      {d.aiResponse && <div className="mt-2 text-sm text-[#6B7280] bg-[#EFF6FF] p-3 rounded-lg border border-[#DBEAFE]"><span className="text-xs font-bold text-[#1E40AF]">AI Response: </span>{d.aiResponse}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
