import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useProgressStore } from "../stores/progressStore";
import { useUniverseStore } from "../stores/universeStore";
import LoadingScreen from "../components/common/LoadingScreen";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { status: progressStatus, progressByPlanet, progresses, load: loadProgress } = useProgressStore();
  const { planets, loadPlanets } = useUniverseStore();

  useEffect(() => {
    if (!planets.length) loadPlanets().catch(() => {});
  }, []);

  useEffect(() => {
    loadProgress().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const continueTopic = useMemo(() => {
    const inProgress = progresses.filter((p) => p.status === "in_progress");
    if (inProgress.length) return inProgress[0];
    return null;
  }, [progresses]);

  if (progressStatus === "loading" || progressStatus === "idle") {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full bg-bg-1 text-neon-2">
      <div className="px-4 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl text-white font-semibold">Dashboard</h1>
          <p className="text-white/70 mt-1 text-sm">
            Track progress, resume learning, and revisit topics in your 3D universe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planets.map(({ planet }) => {
            const percent = progressByPlanet[planet.slug] ?? 0;
            return (
              <div key={planet.id} className="rounded-3xl border border-white/10 bg-bg-2 p-5 shadow-neon">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-white/90 font-semibold">{planet.name}</div>
                    <div className="text-xs text-white/60 mt-1">Completion</div>
                  </div>
                  <div
                    className="text-sm px-3 py-1 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "white",
                    }}
                  >
                    {percent}%
                  </div>
                </div>

                <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percent}%`,
                      background: planet.themeColor,
                      boxShadow: "0 0 18px rgba(170, 59, 255, 0.35)",
                      transition: "width 300ms ease",
                    }}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    className="px-3 py-2 rounded-xl border border-white/10 text-white/80 hover:border-neon/60 hover:text-white text-sm"
                    onClick={() => navigate("/")}
                    type="button"
                  >
                    Explore
                  </button>
                  <div className="flex-1" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-bg-2 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-semibold">Resume Learning</div>
              <div className="text-sm text-white/70 mt-1">Continue your most recent topic progress.</div>
            </div>
            <button
              type="button"
              className="text-sm text-neon hover:underline"
              onClick={() => navigate("/")}
            >
              Open Universe
            </button>
          </div>

          {continueTopic ? (
            <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="text-white font-semibold">{continueTopic.topic.title}</div>
                <div className="text-sm text-white/70 mt-1">
                  {continueTopic.topic.category} · {continueTopic.topic.difficulty}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-neon text-bg-0 font-semibold hover:brightness-110"
                  onClick={() => navigate(`/?topicId=${continueTopic.topicId}`)}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/70">
              No in-progress topics yet. Click any node in the universe to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

