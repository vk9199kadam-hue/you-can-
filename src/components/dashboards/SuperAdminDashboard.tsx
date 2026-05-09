import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAcademies, getAllUsers, addMasterContent, getMasterContent } from "../../firebase/firestore";
import type { Academy, MasterContent, UserProfile } from "../../types";
import { AppShell, Pill } from "../../ui/layout/AppShell";
import { Card } from "../../ui/components/Card";
import { Button } from "../../ui/components/Button";
import { Input, Label, Select } from "../../ui/components/Form";
import { fn } from "../../firebase/functionsClient";

type Tab = "dashboard" | "academies" | "onboard" | "content";

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [masterContent, setMasterContent] = useState<MasterContent[]>([]);
  const [loading, setLoading] = useState(true);

  // Onboarding form (Phase 2 foundation via Cloud Function)
  const [newAcademy, setNewAcademy] = useState<{ name: string; city: string; address: string; phone: string; email: string; plan: "free" | "basic" | "premium"; streams: string[]; classes: string[] }>({ name: "", city: "", address: "", phone: "", email: "", plan: "free", streams: ["PCM"], classes: ["Class 12"] });
  const [head, setHead] = useState<{ name: string; phone: string }>({ name: "", phone: "" });
  const [onboardMsg, setOnboardMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [acads, allUsers, mc] = await Promise.all([getAcademies(), getAllUsers(), getMasterContent()]);
      if (!cancelled) { setAcademies(acads); setUsers(allUsers); setMasterContent(mc); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshData = async () => {
    setLoading(true);
    const [acads, allUsers, mc] = await Promise.all([getAcademies(), getAllUsers(), getMasterContent()]);
    setAcademies(acads);
    setUsers(allUsers);
    setMasterContent(mc);
    setLoading(false);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fn.createAcademyAndHead({
        academy: { ...newAcademy, status: "active" },
        head: { name: head.name, phone: head.phone || undefined },
      });
      const out = res.data as {
        academyId: string;
        headUserCode: string;
        headTempPassword: string;
      };
      setOnboardMsg(
        `Academy created.\nHead UserID: ${out.headUserCode}\nTemp Password: ${out.headTempPassword}\n(Please copy & share securely)`
      );
      setNewAcademy({ name: "", city: "", address: "", phone: "", email: "", plan: "free", streams: ["PCM"], classes: ["Class 12"] });
      setHead({ name: "", phone: "" });
      refreshData();
    } catch (err) {
      setOnboardMsg("Error creating academy: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;

  const [mcForm, setMcForm] = useState<{
    type: MasterContent["type"];
    title: string;
    description: string;
    subject: string;
    classLevel: MasterContent["classLevel"];
    stream: "" | "PCM" | "PCB" | "PCMB";
    chapter: string;
    topic: string;
    fileUrl: string;
    language: "" | "en" | "mr";
  }>({
    type: "pdf",
    title: "",
    description: "",
    subject: "Physics",
    classLevel: "Class 12",
    stream: "",
    chapter: "",
    topic: "",
    fileUrl: "",
    language: "en",
  });
  const [mcMsg, setMcMsg] = useState("");

  const handleAddMasterContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMcMsg("");
    try {
      await addMasterContent({
        type: mcForm.type,
        title: mcForm.title,
        description: mcForm.description || undefined,
        subject: mcForm.subject,
        classLevel: mcForm.classLevel,
        stream: (mcForm.stream || undefined) as MasterContent["stream"],
        chapter: mcForm.chapter || undefined,
        topic: mcForm.topic || undefined,
        examType: [],
        fileUrl: mcForm.fileUrl,
        language: (mcForm.language || undefined) as MasterContent["language"],
      });
      setMcMsg("Master content added.");
      setMcForm({ ...mcForm, title: "", description: "", chapter: "", topic: "", fileUrl: "" });
      refreshData();
    } catch (err) {
      setMcMsg("Error: " + (err instanceof Error ? err.message : "Failed"));
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "academies", label: "Academies", icon: "domain" },
    { id: "onboard", label: "Onboarding", icon: "add_circle" },
    { id: "content", label: "Content", icon: "library_books" },
  ];

  return (
    <AppShell
      topPill={<Pill tone="premium">Super Admin</Pill>}
      title="Platform"
      subtitle="Monitor academies, users, and content"
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
          <h1 className="text-[28px] font-extrabold text-text mb-1 brand">
            Platform Overview
          </h1>
          <p className="text-sm text-text-dim mb-7">
            Monitoring all academies across Maharashtra
          </p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Academies", value: academies.length, color: "#1E40AF", bg: "#EFF6FF", icon: "🏫" },
                  { label: "Students", value: studentCount, color: "#10B981", bg: "#ECFDF5", icon: "👨‍🎓" },
                  { label: "Teachers", value: teacherCount, color: "#8B5CF6", bg: "#F5F3FF", icon: "👨‍🏫" },
                  { label: "Total Users", value: users.length, color: "#F59E0B", bg: "#FFFBEB", icon: "👥" },
                ].map((s) => (
                  <Card key={s.label} className="p-5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                    <div className="text-[28px] font-extrabold" style={{ color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                    <div className="text-[13px] text-text-dim font-medium">{s.label}</div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <h3 className="text-base font-bold text-text mb-4 brand">Registered Academies</h3>
                {academies.length === 0 ? (
                  <p className="text-sm text-text-dim">No academies registered yet. Use the Onboarding tab to add your first academy.</p>
                ) : (
                  <div className="space-y-3">
                    {academies.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-3 bg-bg rounded-lg border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-sm">{a.name[0]}</div>
                          <div>
                            <div className="font-semibold text-sm">{a.name}</div>
                            <div className="text-xs text-text-dim">{a.city} · {a.streams.join(", ")}</div>
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
              </Card>
            </div>
          ) : tab === "academies" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">All Academies</h1>
              <p className="text-sm text-text-dim mb-7">{academies.length} academies registered</p>
              {academies.length === 0 ? (
                <Card className="p-12 text-center"><p className="text-text-dim">No academies yet. Go to Onboarding to add your first academy.</p></Card>
              ) : (
                <Card className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-border bg-bg">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-dim uppercase tracking-wide">Academy</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-dim uppercase tracking-wide">City</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-dim uppercase tracking-wide">Streams</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-dim uppercase tracking-wide">Plan</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-text-dim uppercase tracking-wide">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {academies.map((a) => (
                        <tr key={a.id} className="border-b border-border hover:bg-bg">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#1E40AF] flex items-center justify-center font-bold text-xs">{a.name[0]}</div>
                              <div><div className="font-semibold text-sm">{a.name}</div><div className="text-xs text-text-dim">{a.email}</div></div>
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
                </Card>
              )}
            </div>
          ) : tab === "onboard" ? (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Academy Onboarding</h1>
              <p className="text-sm text-text-dim mb-7">Register a new academy on the platform</p>
              <Card className="p-8 max-w-2xl">
                <h3 className="text-lg font-bold text-text mb-6 brand">Academy Information</h3>
                <form onSubmit={handleOnboard}>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Academy Name</Label>
                      <Input value={newAcademy.name} onChange={(e) => setNewAcademy({ ...newAcademy, name: e.target.value })} required placeholder="e.g. Vidya Academy" />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={newAcademy.city} onChange={(e) => setNewAcademy({ ...newAcademy, city: e.target.value })} required placeholder="e.g. Pune" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={newAcademy.email} onChange={(e) => setNewAcademy({ ...newAcademy, email: e.target.value })} required placeholder="admin@academy.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={newAcademy.phone} onChange={(e) => setNewAcademy({ ...newAcademy, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <Input value={newAcademy.address} onChange={(e) => setNewAcademy({ ...newAcademy, address: e.target.value })} placeholder="Full address" />
                    </div>
                    <div>
                      <Label>Plan</Label>
                      <Select value={newAcademy.plan} onChange={(e) => setNewAcademy({ ...newAcademy, plan: e.target.value as "free" | "basic" | "premium" })}>
                        <option value="free">Free</option>
                        <option value="basic">Basic</option>
                        <option value="premium">Premium</option>
                      </Select>
                    </div>
                    <div>
                      <Label>Streams</Label>
                      <Select value={newAcademy.streams[0]} onChange={(e) => setNewAcademy({ ...newAcademy, streams: [e.target.value] })}>
                        <option value="PCM">PCM</option>
                        <option value="PCB">PCB</option>
                        <option value="PCMB">PCMB</option>
                      </Select>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-text mb-4 brand">Academy Head</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <Label>Head Full Name</Label>
                      <Input value={head.name} onChange={(e) => setHead({ ...head, name: e.target.value })} required placeholder="e.g. Mrs. Kulkarni" />
                    </div>
                    <div>
                      <Label>Head Phone (optional)</Label>
                      <Input value={head.phone} onChange={(e) => setHead({ ...head, phone: e.target.value })} placeholder="+91 98xxxxxxx" />
                    </div>
                  </div>

                  {onboardMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${onboardMsg.includes("Error") ? "bg-[#FEF2F2] text-[#EF4444]" : "bg-[#ECFDF5] text-[#059669]"}`}>
                      <pre className="whitespace-pre-wrap font-sans">{onboardMsg}</pre>
                    </div>
                  )}
                  <Button type="submit">
                    Create Academy
                  </Button>
                </form>
              </Card>
            </div>
          ) : (
            <div>
              <h1 className="text-[28px] font-extrabold text-text mb-1 brand">Content Manager</h1>
              <p className="text-sm text-text-dim mb-7">Manage platform-wide question bank and master study materials</p>

              <div className="grid grid-cols-2 gap-5 mb-6">
                <Card className="p-6">
                  <h3 className="font-bold text-base mb-1 brand">Add Master Content</h3>
                  <p className="text-[13px] text-text-dim mb-4">Add NCERT/eBalbharati/PYQs/notes links for all academies (access controlled).</p>
                  <form onSubmit={handleAddMasterContent} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select value={mcForm.type} onChange={(e) => setMcForm({ ...mcForm, type: e.target.value as MasterContent["type"] })}>
                          <option value="pdf">PDF</option>
                          <option value="notes">Notes</option>
                          <option value="video">Video</option>
                          <option value="pyq_set">PYQ Set</option>
                          <option value="formula_sheet">Formula Sheet</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Language</Label>
                        <Select value={mcForm.language} onChange={(e) => setMcForm({ ...mcForm, language: e.target.value as "en" | "mr" })}>
                          <option value="en">English</option>
                          <option value="mr">Marathi</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input value={mcForm.title} onChange={(e) => setMcForm({ ...mcForm, title: e.target.value })} required placeholder="e.g. Electrostatics Notes (eBalbharati)" />
                    </div>
                    <div>
                      <Label>File URL</Label>
                      <Input value={mcForm.fileUrl} onChange={(e) => setMcForm({ ...mcForm, fileUrl: e.target.value })} required placeholder="https://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Subject</Label>
                        <Select value={mcForm.subject} onChange={(e) => setMcForm({ ...mcForm, subject: e.target.value })}>
                          <option>Physics</option>
                          <option>Chemistry</option>
                          <option>Mathematics</option>
                          <option>Biology</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Class</Label>
                        <Select value={mcForm.classLevel} onChange={(e) => setMcForm({ ...mcForm, classLevel: e.target.value as MasterContent["classLevel"] })}>
                          <option value="Class 11">Class 11</option>
                          <option value="Class 12">Class 12</option>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Stream (optional)</Label>
                        <Select value={mcForm.stream} onChange={(e) => setMcForm({ ...mcForm, stream: e.target.value as "" | "PCM" | "PCB" | "PCMB" })}>
                          <option value="">All</option>
                          <option value="PCM">PCM</option>
                          <option value="PCB">PCB</option>
                          <option value="PCMB">PCMB</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Chapter (optional)</Label>
                        <Input value={mcForm.chapter} onChange={(e) => setMcForm({ ...mcForm, chapter: e.target.value })} placeholder="e.g. Electrostatics" />
                      </div>
                    </div>
                    <div>
                      <Label>Topic (optional)</Label>
                      <Input value={mcForm.topic} onChange={(e) => setMcForm({ ...mcForm, topic: e.target.value })} placeholder="e.g. Gauss's Law" />
                    </div>
                    <div>
                      <Label>Description (optional)</Label>
                      <Input value={mcForm.description} onChange={(e) => setMcForm({ ...mcForm, description: e.target.value })} placeholder="Short description" />
                    </div>
                    {mcMsg ? (
                      <div className={`p-3 rounded-lg text-sm font-medium ${mcMsg.startsWith("Error") ? "bg-[#FEF2F2] text-error" : "bg-[#ECFDF5] text-[#059669]"}`}>
                        {mcMsg}
                      </div>
                    ) : null}
                    <Button type="submit">Add Content</Button>
                  </form>
                </Card>

                <Card className="p-6">
                  <h3 className="font-bold text-base mb-1 brand">Master Content Library</h3>
                  <p className="text-[13px] text-text-dim mb-4">{masterContent.length} items</p>
                  {masterContent.length === 0 ? (
                    <p className="text-sm text-text-dim">No master content added yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                      {masterContent.slice(0, 50).map((c) => (
                        <div key={c.id} className="p-3 rounded-lg border border-border bg-bg">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-semibold text-sm truncate">{c.title}</div>
                              <div className="text-xs text-text-dim truncate">
                                {c.classLevel} · {c.subject}
                                {c.chapter ? ` · ${c.chapter}` : ""}
                                {c.topic ? ` · ${c.topic}` : ""}
                              </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-primary border border-[#DBEAFE]">
                              {c.type}
                            </span>
                          </div>
                          <a className="text-xs text-primary-light font-medium hover:underline" href={c.fileUrl} target="_blank" rel="noreferrer">
                            Open link
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6">
                  <span className="material-icons-outlined text-4xl text-primary mb-3 block">upload_file</span>
                  <h3 className="font-bold text-base mb-1">Bulk Import Questions</h3>
                  <p className="text-[13px] text-text-dim mb-4">Upload JSON files from local_db.json or external sources</p>
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
                  }} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition">
                    Import from local_db.json
                  </button>
                </Card>
                <Card className="p-6">
                  <span className="material-icons-outlined text-4xl text-secondary mb-3 block">quiz</span>
                  <h3 className="font-bold text-base mb-1">Question Bank Stats</h3>
                  <p className="text-[13px] text-text-dim mb-4">View and manage all questions in the platform</p>
                  <button onClick={async () => {
                    const { getQuestions } = await import("../../firebase/firestore");
                    const qs = await getQuestions();
                    alert(`Total questions in Firestore: ${qs.length}`);
                  }} className="px-4 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition">
                    Check Question Count
                  </button>
                </Card>
              </div>
            </div>
          )}
    </AppShell>
  );
}
