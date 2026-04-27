import { useState, useEffect } from "react";
import { loginUser, registerUser } from "../firebase/auth";
import { getAcademies } from "../firebase/firestore";
import type { Academy, UserRole } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { setUser } = useAuth();
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    getAcademies().then((list) => {
      setAcademies(list);
      if (list.length > 0) setSelectedAcademy(list[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!name) { setError("Please enter your name"); setLoading(false); return; }
        const academy = academies.find((a) => a.id === selectedAcademy);
        const profile = await registerUser(email, password, {
          name,
          role: isSuperAdmin ? "super_admin" : role,
          academyId: isSuperAdmin ? "platform" : selectedAcademy,
          academyName: isSuperAdmin ? "Platform Admin" : (academy?.name ?? ""),
        });
        setUser(profile);
      } else {
        const profile = await loginUser(email, password);
        setUser(profile);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
        setError("Invalid email or password");
      } else if (message.includes("auth/user-not-found")) {
        setError("No account found with this email");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("An account with this email already exists");
      } else if (message.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters");
      } else {
        setError(message);
      }
    }
    setLoading(false);
  };

  const roles: { value: UserRole; label: string; icon: string }[] = [
    { value: "student", label: "Student", icon: "school" },
    { value: "teacher", label: "Teacher", icon: "person" },
    { value: "academy_head", label: "Head", icon: "domain" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#1E40AF] inline-flex items-center justify-center font-extrabold text-xl text-white mb-4">
            Y
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937] mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            {isSignup ? "Create Account" : "Welcome to YOU CAN"}
          </h2>
          <p className="text-sm text-[#6B7280]">
            {isSignup ? "Register for your academy" : "Sign in to your academy dashboard"}
          </p>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit}>
            {!isSuperAdmin && (
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Academy</label>
                <select
                  value={selectedAcademy}
                  onChange={(e) => setSelectedAcademy(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition"
                >
                  {academies.length === 0 && <option value="">No academies found</option>}
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}, {a.city}</option>
                  ))}
                </select>
              </div>
            )}

            {!isSuperAdmin && (
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">I am a</label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`py-3 rounded-lg text-center transition border-2 ${
                        role === r.value
                          ? "border-[#1E40AF] bg-[#EFF6FF] text-[#1E40AF]"
                          : "border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <span className="material-icons-outlined text-xl block mb-1">{r.icon}</span>
                      <span className="text-xs font-semibold">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSignup && (
              <div className="mb-5">
                <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]"
                />
              </div>
            )}

            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[13px] font-semibold text-[#1F2937] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#1F2937] bg-white outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 transition placeholder:text-[#9CA3AF]"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-sm text-[#EF4444] font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1E40AF] text-white font-semibold rounded-lg hover:bg-[#1E3A8A] transition disabled:opacity-50 text-[15px]"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsSignup(!isSignup); setError(""); }}
                className="text-sm text-[#3B82F6] font-medium hover:underline"
              >
                {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center mt-4 text-[13px] text-[#6B7280]">
          Platform admin?{" "}
          <button
            onClick={() => { setIsSuperAdmin(!isSuperAdmin); setError(""); }}
            className="text-[#1E40AF] font-semibold hover:underline"
          >
            {isSuperAdmin ? "Back to Academy Login" : "Super Admin Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
