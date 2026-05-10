import { useState } from "react";
import { setNewPassword } from "../firebase/auth";
import { updateUserProfile } from "../firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../ui/components/Card";
import { Button } from "../ui/components/Button";
import { Input, Label } from "../ui/components/Form";
import { BrandMark } from "../ui/layout/AppShell";

export default function FirstLoginReset() {
  const { user, setUser, logout } = useAuth();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (pw1.length < 6) return setMsg("Password must be at least 6 characters.");
    if (pw1 !== pw2) return setMsg("Passwords do not match.");
    setBusy(true);
    try {
      await setNewPassword(pw1);
      await updateUserProfile(user.uid, { tempPassword: false });
      setUser({ ...user, tempPassword: false });
      setMsg("Password updated. Redirecting…");
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-[520px]">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-4">
            <BrandMark />
          </div>
          <h2 className="text-2xl font-extrabold text-text mb-1 brand">Set a new password</h2>
          <p className="text-sm text-text-dim">
            Your account was created with a temporary password. Please set a new one to continue.
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>New password</Label>
              <Input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Minimum 6 characters" />
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Re-enter password" />
            </div>

            {msg ? (
              <div className={`p-3 rounded-lg text-sm font-medium ${msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("match") ? "bg-[#FEF2F2] text-error border border-[#FCA5A5]" : "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]"}`}>
                {msg}
              </div>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={busy} className="flex-1">
                {busy ? "Updating..." : "Update password"}
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => void logout()}>
                Logout
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

