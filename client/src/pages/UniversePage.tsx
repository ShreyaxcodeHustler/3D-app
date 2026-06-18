import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUniverseStore } from "../stores/universeStore";
import TopBar from "../components/layout/TopBar";
import GalaxyScene from "../components/three/GalaxyScene";
import PlanetPanel from "../components/topic/PlanetPanel";
import TopicPanel from "../components/topic/TopicPanel";

export default function UniversePage() {
  const [searchParams] = useSearchParams();
  const { status, error, planets, selectedPlanetSlug, selectedTopic, loadPlanets, clearSelection, selectPlanet, selectTopic } = useUniverseStore();
  const topicIdParam = searchParams.get("topicId");

  useEffect(() => {
    if (planets.length === 0 && status !== "loading") {
      loadPlanets().catch(() => {
        // error state handled in scene panel
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!topicIdParam) return;
    if (!planets.length) return;
    for (const p of planets) {
      const topic = p.topics.find((t) => t.id === topicIdParam);
      if (!topic) continue;
      selectPlanet(p.planet.slug);
      selectTopic(topic);
      break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIdParam, planets.length]);

  const selectedPlanet = selectedPlanetSlug
    ? planets.find((p) => p.planet.slug === selectedPlanetSlug) || null
    : null;
  const hasTopics = planets.length > 0;
  const isLoading = status === "loading";
  const isError = status === "error";

  return (
    <div className="min-h-screen w-full bg-bg-1 text-neon-2 overflow-hidden">
      <TopBar />
      <div className="relative w-full" style={{ height: "calc(100svh - 64px)" }}>
        {hasTopics ? (
          <GalaxyScene />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center text-white/70">
            {isError ? (
              <>
                <div className="text-2xl text-white font-semibold">Could not load galaxy</div>
                <p className="max-w-md">
                  {error ?? "Please check your connection and try again."}
                </p>
                <button
                  type="button"
                  className="rounded-2xl bg-neon px-5 py-3 text-sm font-semibold text-bg-0 transition hover:brightness-110"
                  onClick={() => loadPlanets().catch(() => {})}
                >
                  Retry
                </button>
              </>
            ) : isLoading ? (
              <div className="text-lg">Loading galaxy…</div>
            ) : (
              <div className="text-lg">No planets available yet.</div>
            )}
          </div>
        )}
        {selectedPlanet && !selectedTopic ? (
          <PlanetPanel
            planet={selectedPlanet}
            onClose={clearSelection}
            onTopicSelect={selectTopic}
          />
        ) : null}
        {selectedTopic ? <TopicPanel topic={selectedTopic} onClose={clearSelection} /> : null}
      </div>
    </div>
  );
}

