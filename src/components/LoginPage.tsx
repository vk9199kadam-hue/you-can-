import { useState, useEffect } from "react";
import { loginWithUserCode, registerUser } from "../firebase/auth";
import { getAcademies } from "../firebase/firestore";
import type { Academy, UserRole } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../ui/components/Button";
import { Card } from "../ui/components/Card";
import { Input, Label, Select } from "../ui/components/Form";
import { BrandMark } from "../ui/layout/AppShell";
import { cn } from "../ui/cn";

export default function LoginPage() {
  const { setUser } = useAuth();
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [userId, setUserId] = useState("");
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
        const profile = await registerUser(`${Date.now()}@signup.youcan`, password, {
          name,
          role: isSuperAdmin ? "super_admin" : role,
          academyId: isSuperAdmin ? "platform" : selectedAcademy,
          academyName: isSuperAdmin ? "Platform Admin" : (academy?.name ?? ""),
        });
        setUser(profile);
      } else {
        if (isSuperAdmin) {
          setError("Super Admin login is not yet migrated to UserID flow. Use existing admin account email/password for now.");
          setLoading(false);
          return;
        }
        const profile = await loginWithUserCode({
          academyId: selectedAcademy,
          role,
          userCode: userId,
          password,
        });
        setUser(profile);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
        setError("Invalid User ID or password");
      } else if (message.includes("auth/user-not-found")) {
        setError("No account found with this User ID");
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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden">
      <div className="yc-grid-bg" />
      <div className="absolute -top-40 -left-48 w-[520px] h-[520px] rounded-full blur-3xl opacity-30 bg-primary-light" />
      <div className="absolute -bottom-56 -right-40 w-[620px] h-[620px] rounded-full blur-3xl opacity-25 bg-[#8B5CF6]" />
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <BrandMark />
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-1 brand">
            {isSignup ? "Create Account" : "Welcome to YOU CAN"}
          </h2>
          <p className="text-sm text-text-dim">
            {isSignup ? "Register for your academy" : "Sign in to your academy dashboard"}
          </p>
        </div>

        <Card className="p-8 relative">
          <form onSubmit={handleSubmit}>
            {!isSuperAdmin && (
              <div className="mb-5">
                <Label>Academy</Label>
                <Select
                  value={selectedAcademy}
                  onChange={(e) => setSelectedAcademy(e.target.value)}
                >
                  {academies.length === 0 && <option value="">No academies found</option>}
                  {academies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}, {a.city}</option>
                  ))}
                </Select>
              </div>
            )}

            {!isSuperAdmin && (
              <div className="mb-5">
                <Label>I am a</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        "py-3 rounded-lg text-center transition border-2",
                        role === r.value
                          ? "border-primary bg-[#EFF6FF] text-primary"
                          : "border-border bg-surface text-text-dim hover:bg-bg",
                      )}
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
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="mb-5">
              <Label>User ID</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. STU-ACAD01-0001"
              />
            </div>

            <div className="mb-6">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg text-sm text-error font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setIsSignup(!isSignup); setError(""); }}
                className="text-sm text-primary-light font-medium hover:underline"
              >
                {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </Card>

        <p className="text-center mt-4 text-[13px] text-text-dim">
          Platform admin?{" "}
          <button
            onClick={() => { setIsSuperAdmin(!isSuperAdmin); setError(""); }}
            className="text-primary font-semibold hover:underline"
          >
            {isSuperAdmin ? "Back to Academy Login" : "Super Admin Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
