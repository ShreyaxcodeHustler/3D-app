import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  const isLoading = status === "loading";

  const canSubmit = useMemo(() => email.trim().length > 0 && password.trim().length > 0, [email, password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-1 text-neon-2 p-6">
      <div className="w-full max-w-md border border-neon/20 rounded-3xl bg-bg-2 shadow-neon p-6">
        <h1 className="text-2xl font-semibold text-white">Sign In</h1>
        <p className="text-sm text-white/70 mt-1">Access your learning universe.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-white/80">Email</span>
            <input
              className="px-4 py-2 rounded-xl bg-bg-1 border border-white/10 outline-none focus:border-neon/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-white/80">Password</span>
            <input
              className="px-4 py-2 rounded-xl bg-bg-1 border border-white/10 outline-none focus:border-neon/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <div className="text-sm text-red-300">{error}</div> : null}

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="mt-2 px-4 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          <button
            type="button"
            disabled={isLoading}
            className="mt-1 px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white font-semibold disabled:opacity-60"
            onClick={() => navigate("/")}
          >
            Explore as Guest
          </button>

          <div className="text-center text-sm text-white/70 mt-2">
            No account?{" "}
            <button type="button" onClick={() => navigate("/signup")} className="text-neon hover:underline">
              Create one
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

