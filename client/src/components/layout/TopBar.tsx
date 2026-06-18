import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

export default function TopBar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const authStatus = useAuthStore((s) => s.status);
  const canAccessDashboard = authStatus === "authenticated" && Boolean(user);

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 border-b border-white/10 bg-bg-1/70 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-neon shadow-neon flex items-center justify-center font-bold text-bg-0">
          U
        </div>
        <div>
          <div className="text-sm text-white/80">Learning Universe</div>
          <div className="text-xs text-white/50">Welcome{user ? `, ${user.name}` : ""}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-sm"
          onClick={() => navigate("/")}
          type="button"
        >
          Universe
        </button>
        {canAccessDashboard ? (
          <>
            <button
              className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-sm"
              onClick={() => navigate("/dashboard")}
              type="button"
            >
              Dashboard
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-sm"
              onClick={() => logout().then(() => navigate("/login"))}
              type="button"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-sm"
              onClick={() => navigate("/login")}
              type="button"
            >
              Sign in
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110 text-sm"
              onClick={() => navigate("/signup")}
              type="button"
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
}

