import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAcademies, getAllUsers, createAcademy } from "../../firebase/firestore";
import type { Academy, UserProfile } from "../../types";

type Tab = "dashboard" | "academies" | "onboard" | "content";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding form
  const [newAcademy, setNewAcademy] = useState<{ name: string; city: string; address: string; phone: string; email: string; plan: "free" | "basic" | "premium"; streams: string[]; classes: string[] }>({ name: "", city: "", address: "", phone: "", email: "", plan: "free", streams: ["PCM"], classes: ["Class 12"] });
  const [onboardMsg, setOnboardMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [acads, allUsers] = await Promise.all([getAcademies(), getAllUsers()]);
      if (!cancelled) { setAcademies(acads); setUsers(allUsers); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [acads, allUsers] = await Promise.all([getAcademies(), getAllUsers()]);
    setAcademies(acads);
    setUsers(allUsers);
    setLoading(false);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAcademy({ ...newAcademy, status: "active" });
      setOnboardMsg("Academy created successfully!");
      setNewAcademy({ name: "", city: "", address: "", phone: "", email: "", plan: "free", streams: ["PCM"], classes: ["Class 12"] });
      refreshData();
    } catch (err) {
      setOnboardMsg("Error creating academy: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "academies", label: "Academies", icon: "domain" },
    { id: "onboard", label: "Onboarding", icon: "add_circle" },
    { id: "content", label: "Content", icon: "library_books" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Top bar */}
      <header className="bg-white border-b border-[#E5E7EB] px-6 h-14 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center font-extrabold text-sm text-white">Y</div>
          <span className="font-bold text-[15px] text-[#1F2937]" style={{ fontFamily: "Outfit, sans-serif" }}>YOU CAN</span>
          <span className="text-xs text-[#6B7280] ml-2">Super Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B7280]">{user?.name}</span>
          <button onClick={logout} className="text-sm text-[#EF4444] font-semibold hover:underline">Logout</button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-60 bg-white border-r border-[#E5E7EB] min-h-[calc(100vh-56px)] p-3 sticky top-14">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition ${
                tab === t.id ? "bg-[#EFF6FF] text-[#1E40AF]" : "text-[#6B7280] hover:bg-[#F9FAFB]"
              }`}
            >
              <span className="material-icons-outlined text-xl">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-8 max-w-[1100px]">
          {loading ? (
            <div className="text-center text-[#6B7280] py-20">Loading...</div>
          ) : tab === "dashboard" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Super Admin</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Platform Overview</h1>
              <p className="text-sm text-[#6B7280] mb-7">Monitoring all academies across Maharashtra</p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Academies", value: academies.length, color: "#1E40AF", bg: "#EFF6FF", icon: "🏫" },
                  { label: "Students", value: studentCount, color: "#10B981", bg: "#ECFDF5", icon: "👨‍🎓" },
                  { label: "Teachers", value: teacherCount, color: "#8B5CF6", bg: "#F5F3FF", icon: "👨‍🏫" },
                  { label: "Total Users", value: users.length, color: "#F59E0B", bg: "#FFFBEB", icon: "👥" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-sm">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                    <div className="text-[28px] font-extrabold" style={{ color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                    <div className="text-[13px] text-[#6B7280] font-medium">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-[#1F2937] mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>Registered Academies</h3>
                {academies.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No academies registered yet. Use the Onboarding tab to add your first academy.</p>
                ) : (
                  <div className="space-y-3">
                    {academies.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-sm">{a.name[0]}</div>
                          <div>
                            <div className="font-semibold text-sm">{a.name}</div>
                            <div className="text-xs text-[#6B7280]">{a.city} · {a.streams.join(", ")}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            a.plan === "premium" ? "bg-[#ECFDF5] text-[#059669]" : a.plan === "basic" ? "bg-[#EFF6FF] text-[#1E40AF]" : "bg-[#FFFBEB] text-[#D97706]"
                          }`}>{a.plan}</span>
                          <span className="flex items-center gap-1 text-xs text-[#10B981]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : tab === "academies" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Super Admin</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>All Academies</h1>
              <p className="text-sm text-[#6B7280] mb-7">{academies.length} academies registered</p>
              {academies.length === 0 ? (
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center">
                  <p className="text-[#6B7280]">No academies yet. Go to Onboarding to add your first academy.</p>
                </div>
              ) : (
                <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#E5E7EB] bg-[#F9FAFB]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Academy</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">City</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Streams</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academies.map((a) => (
                        <tr key={a.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-xs">{a.name[0]}</div>
                              <div><div className="font-semibold text-sm">{a.name}</div><div className="text-xs text-[#6B7280]">{a.email}</div></div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm">{a.city}</td>
                          <td className="px-4 py-3.5"><span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF]">{a.streams.join(" + ")}</span></td>
                          <td className="px-4 py-3.5"><span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${a.plan === "premium" ? "bg-[#ECFDF5] text-[#059669]" : a.plan === "basic" ? "bg-[#EFF6FF] text-[#1E40AF]" : "bg-[#FFFBEB] text-[#D97706]"}`}>{a.plan}</span></td>
                          <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-xs text-[#10B981] font-medium"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>{a.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : tab === "onboard" ? (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Super Admin</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Academy Onboarding</h1>
              <p className="text-sm text-[#6B7280] mb-7">Register a new academy on the platform</p>
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-sm max-w-2xl">
                <h3 className="text-lg font-bold text-[#1F2937] mb-6" style={{ fontFamily: "Outfit, sans-serif" }}>Academy Information</h3>
                <form onSubmit={handleOnboard}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Academy Name</label>
                      <input value={newAcademy.name} onChange={(e) => setNewAcademy({ ...newAcademy, name: e.target.value })} required placeholder="e.g. Vidya Academy" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">City</label>
                      <input value={newAcademy.city} onChange={(e) => setNewAcademy({ ...newAcademy, city: e.target.value })} required placeholder="e.g. Pune" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Email</label>
                      <input type="email" value={newAcademy.email} onChange={(e) => setNewAcademy({ ...newAcademy, email: e.target.value })} required placeholder="admin@academy.com" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Phone</label>
                      <input value={newAcademy.phone} onChange={(e) => setNewAcademy({ ...newAcademy, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Address</label>
                      <input value={newAcademy.address} onChange={(e) => setNewAcademy({ ...newAcademy, address: e.target.value })} placeholder="Full address" className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]" />
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Plan</label>
                      <select value={newAcademy.plan} onChange={(e) => setNewAcademy({ ...newAcademy, plan: e.target.value as "free" | "basic" | "premium" })} className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition">
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Streams</label>
                      <select value={newAcademy.streams[0]} onChange={(e) => setNewAcademy({ ...newAcademy, streams: [e.target.value] })} className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition">
                        <option value="PCM">PCM</option>
                        <option value="PCB">PCB</option>
                        <option value="PCMB">PCMB</option>
                      </select>
                    </div>
                  </div>
                  {onboardMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${onboardMsg.includes("Error") ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#ECFDF5] text-[#059669]"}`}>
                      {onboardMsg}
                    </div>
                  )}
                  <button type="submit" className="px-6 py-2.5 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition text-sm">
                    Create Academy
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#1E40AF] uppercase tracking-wider mb-1">Super Admin</p>
              <h1 className="text-[28px] font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Content Manager</h1>
              <p className="text-sm text-[#6B7280] mb-7">Manage platform-wide question bank and study materials</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <span className="material-icons-outlined text-4xl text-[#1E40AF] mb-3 block">upload_file</span>
                  <h3 className="font-bold text-base mb-1">Bulk Import Questions</h3>
                  <p className="text-[13px] text-[#6B7280] mb-4">Upload JSON files from local_db.json or external sources</p>
                  <button onClick={async () => {
                    try {
                      const res = await fetch("/local_db.json");
                      const data = await res.json();
                      const { bulkAddQuestions } = await import("../../firebase/firestore");
                      const count = await bulkAddQuestions(data.questions.map((q: Record<string, unknown>) => ({
                        subject: q.subject,
                        chapter: q.chapter,
                        topic: q.topic,
                        question: q.question,
                        options: q.options,
                        answer: q.answer,
                        explanation: q.explanation,
                        difficulty: q.difficulty,
                        examType: q.exam_type,
                        isPYQ: q.is_pyq || false,
                      })));
                      alert(`Imported ${count} questions!`);
                    } catch (err) {
                      alert("Error: " + (err instanceof Error ? err.message : "Failed"));
                    }
                  }} className="px-4 py-2 bg-[#1E40AF] text-white text-sm font-semibold rounded-lg hover:bg-[#1E3A8A] transition">
                    Import from local_db.json
                  </button>
                </div>
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <span className="material-icons-outlined text-4xl text-[#10B981] mb-3 block">quiz</span>
                  <h3 className="font-bold text-base mb-1">Question Bank Stats</h3>
                  <p className="text-[13px] text-[#6B7280] mb-4">View and manage all questions in the platform</p>
                  <button onClick={async () => {
                    const { getQuestions } = await import("../../firebase/firestore");
                    const qs = await getQuestions();
                    alert(`Total questions in Firestore: ${qs.length}`);
                  }} className="px-4 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition">
                    Check Question Count
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
