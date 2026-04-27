import { useState } from "react";

interface LoginPageProps {
  onLogin: (name: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [classLevel, setClassLevel] = useState("Class 12");
  const [stream, setStream] = useState("PCM");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (isSignup && !name) {
      setError("Please enter your name");
      return;
    }

    onLogin(isSignup ? name : email.split("@")[0]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative flex items-center justify-center">
      <div className="grid-bg"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-10 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-2xl">
              Y
            </div>
            <span className="brand text-3xl font-bold tracking-tighter uppercase">
              YOU <span className="gradient-text">CAN</span>
            </span>
          </div>
          <h2 className="text-3xl font-black mb-2">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-text-dim">
            {isSignup
              ? "Start your preparation journey"
              : "Continue your preparation"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6 animate-fade-in"
        >
          {isSignup && (
            <div>
              <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
            />
          </div>

          {isSignup && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                  Class
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="Class 11" className="bg-bg">
                    Class 11
                  </option>
                  <option value="Class 12" className="bg-bg">
                    Class 12
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">
                  Stream
                </label>
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary/50 transition-all cursor-pointer"
                >
                  <option value="PCM" className="bg-bg">
                    PCM (Engineering)
                  </option>
                  <option value="PCB" className="bg-bg">
                    PCB (Medical)
                  </option>
                  <option value="PCMB" className="bg-bg">
                    PCMB (Both)
                  </option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="text-accent text-sm text-center bg-accent/10 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-premium w-full py-4 text-lg font-bold"
          >
            {isSignup ? "Create Account" : "Sign In"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-primary text-sm font-bold hover:underline"
            >
              {isSignup
                ? "Already have an account? Sign In"
                : "New here? Create Account"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onLogin("Guest Student")}
            className="text-text-dim text-sm hover:text-white transition-colors"
          >
            Continue as Guest &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
