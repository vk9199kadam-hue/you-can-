import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUsersByAcademy, getHomeworkByAcademy, getMasterContent, getAcademyContentAccess, setAcademyContentAccess } from "../../firebase/firestore";
import type { UserProfile, HomeworkAssignment } from "../../types";
import type { AcademyContentAccess, MasterContent } from "../../types";
import { AppShell, Pill } from "../../ui/layout/AppShell";
import { Card } from "../../ui/components/Card";
import { Button } from "../../ui/components/Button";

type Tab = "dashboard" | "teachers" | "students" | "content" | "reports";

export default function AcademyHeadDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [masterContent, setMasterContent] = useState<MasterContent[]>([]);
  const [access, setAccess] = useState<AcademyContentAccess[]>([]);
  const [contentMsg, setContentMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.academyId) return;
    let cancelled = false;
    (async () => {
      const [t, s, hw, mc, acc] = await Promise.all([
        getUsersByAcademy(user.academyId, "teacher"),
        getUsersByAcademy(user.academyId, "student"),
        getHomeworkByAcademy(user.academyId),
        getMasterContent(),
        getAcademyContentAccess(user.academyId),
      ]);
      if (!cancelled) { setTeachers(t); setStudents(s); setHomework(hw); setMasterContent(mc); setAccess(acc); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [user?.academyId]);

  const refreshContent = async () => {
    if (!user?.academyId) return;
    const [mc, acc] = await Promise.all([getMasterContent(), getAcademyContentAccess(user.academyId)]);
    setMasterContent(mc);
    setAccess(acc);
  };

  const isEnabled = (contentId: string) => access.some((a) => a.contentId === contentId && a.enabled);

  const toggleAccess = async (contentId: string, enabled: boolean) => {
    if (!user?.academyId) return;
    setContentMsg("");
    try {
      await setAcademyContentAccess({ academyId: user.academyId, contentId, enabled });
      await refreshContent();
      setContentMsg("Access updated.");
    } catch (err) {
      setContentMsg("Error: " + (err instanceof Error ? err.message : "Failed"));
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "teachers", label: "Teachers", icon: "person" },
    { id: "students", label: "Students", icon: "school" },
    { id: "content", label: "Content Access", icon: "library_books" },
    { id: "reports", label: "Reports", icon: "bar_chart" },
  ];

  return (
    <AppShell
      topPill={<Pill tone="success">{user?.academyName || "Academy"}</Pill>}
      title="Academy Head"
      subtitle="Monitor teachers, students, and content"
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
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Academy Head</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Academy Overview</h1>
              <p className="text-sm text-[#6B7280] mb-7">Welcome back, {user?.name}</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Students", value: students.length, color: "#1E40AF", bg: "#EFF6FF", icon: "👨‍🎓" },
                  { label: "Teachers", value: teachers.length, color: "#8B5CF6", bg: "#F5F3FF", icon: "👨‍🏫" },
                  { label: "HW Assigned", value: homework.length, color: "#F59E0B", bg: "#FFFBEB", icon: "📝" },
                  { label: "Active", value: teachers.filter(t => t.status === "active").length + "/" + teachers.length, color: "#10B981", bg: "#ECFDF5", icon: "🎯" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                    <div className="text-[28px] font-extrabold" style={{ color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                    <div className="text-[13px] text-[#6B7280] font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Teachers</h3>
                  {teachers.length === 0 ? <p className="text-sm text-[#6B7280]">No teachers registered yet.</p> : (
                    <div className="space-y-3">
                      {teachers.map((t) => (
                        <div key={t.uid} className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg">
                          <div className="w-9 h-9 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-sm">{t.name[0]}</div>
                          <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-[#6B7280]">{t.subject || "—"}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <h3 className="font-bold text-base mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Recent Homework</h3>
                  {homework.length === 0 ? <p className="text-sm text-[#6B7280]">No homework assigned yet.</p> : (
                    <div className="space-y-3">
                      {homework.slice(0, 5).map((hw) => (
                        <div key={hw.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                          <div><div className="font-semibold text-sm">{hw.chapter}</div><div className="text-xs text-[#6B7280]">{hw.subject} · {hw.questionCount} Qs</div></div>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${hw.status === "published" ? "bg-[#ECFDF5] text-[#059669]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>{hw.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : tab === "teachers" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Academy Head</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Teacher Management</h1>
              <p className="text-sm text-[#6B7280] mb-7">{teachers.length} teachers in your academy</p>
              {teachers.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center"><p className="text-[#6B7280]">No teachers registered. Teachers need to sign up with your academy selected.</p></div>
              ) : (
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead><tr className="border-b-2 border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Teacher</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Subject</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                    </tr></thead>
                    <tbody>
                      {teachers.map((t) => (
                        <tr key={t.uid} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                          <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-xs">{t.name[0]}</div><span className="font-semibold text-sm">{t.name}</span></div></td>
                          <td className="px-4 py-3.5 text-sm">{t.subject || "—"}</td>
                          <td className="px-4 py-3.5 text-sm text-[#6B7280]">{t.email}</td>
                          <td className="px-4 py-3.5"><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">{t.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : tab === "students" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Academy Head</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Students</h1>
              <p className="text-sm text-[#6B7280] mb-7">{students.length} students enrolled</p>
              {students.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center"><p className="text-[#6B7280]">No students registered yet.</p></div>
              ) : (
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead><tr className="border-b-2 border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Student</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Class</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Stream</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                    </tr></thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.uid} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                          <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center font-bold text-xs">{s.name[0]}</div><span className="font-semibold text-sm">{s.name}</span></div></td>
                          <td className="px-4 py-3.5 text-sm">{s.classLevel || "—"}</td>
                          <td className="px-4 py-3.5 text-sm">{s.stream || "—"}</td>
                          <td className="px-4 py-3.5 text-sm text-[#6B7280]">{s.email}</td>
                          <td className="px-4 py-3.5"><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">{s.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : tab === "content" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Content Access</h1>
              <p className="text-sm text-text-dim mb-7">Enable platform master content for your academy</p>

              {contentMsg ? (
                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${contentMsg.startsWith("Error") ? "bg-[#FEF2F2] text-error" : "bg-[#ECFDF5] text-[#059669]"}`}>
                  {contentMsg}
                </div>
              ) : null}

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-base brand">Master Content Library</div>
                    <div className="text-[13px] text-text-dim">{masterContent.length} items</div>
                  </div>
                  <Button variant="outline" onClick={refreshContent}>Refresh</Button>
                </div>

                {masterContent.length === 0 ? (
                  <p className="text-sm text-text-dim">No master content available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {masterContent.slice(0, 60).map((c) => {
                      const enabled = isEnabled(c.id);
                      return (
                        <div key={c.id} className="p-3 rounded-lg border border-border bg-bg flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{c.title}</div>
                            <div className="text-xs text-text-dim truncate">
                              {c.classLevel} · {c.subject}
                              {c.chapter ? ` · ${c.chapter}` : ""}
                              {c.topic ? ` · ${c.topic}` : ""}
                            </div>
                            <a className="text-xs text-primary-light font-medium hover:underline" href={c.fileUrl} target="_blank" rel="noreferrer">
                              Open link
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleAccess(c.id, !enabled)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              enabled
                                ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                                : "bg-surface text-text-dim border-border hover:bg-bg"
                            }`}
                          >
                            {enabled ? "Enabled" : "Enable"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Academy Head</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Reports & Export</h1>
              <p className="text-sm text-[#6B7280] mb-7">Generate downloadable reports</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Monthly Progress", desc: "Student-wise accuracy and homework completion", icon: "bar_chart", color: "#1E40AF" },
                  { title: "Batch Comparison", desc: "Side-by-side performance across batches", icon: "compare_arrows", color: "#10B981" },
                  { title: "Parent Report Card", desc: "Individual student report with remarks", icon: "family_restroom", color: "#F59E0B" },
                  { title: "Board Compliance", desc: "Syllabus coverage and timetable adherence", icon: "verified", color: "#8B5CF6" },
                ].map((r) => (
                  <div key={r.title} className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                    <span className="material-icons-outlined text-4xl mb-3 block" style={{ color: r.color }}>{r.icon}</span>
                    <h3 className="font-bold text-base mb-1">{r.title}</h3>
                    <p className="text-[13px] text-[#6B7280] mb-4">{r.desc}</p>
                    <button className="px-4 py-2 bg-[#1E40AF] text-white text-sm font-semibold rounded-lg hover:bg-[#1E3A8A] transition">Generate PDF</button>
                  </div>
                ))}
              </div>
            </div>
          )}
    </AppShell>
  );
}
