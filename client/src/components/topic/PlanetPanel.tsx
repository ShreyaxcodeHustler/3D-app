import type { TopicDTO, UniversePlanet } from "../../stores/universeStore";

type PlanetPanelProps = {
  planet: UniversePlanet;
  onClose: () => void;
  onTopicSelect: (topic: TopicDTO) => void;
};

export default function PlanetPanel({ planet, onClose, onTopicSelect }: PlanetPanelProps) {
  return (
    <div className="absolute inset-0 z-40">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] lg:w-[520px] bg-bg-2 border-l border-white/10 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-neon text-xs tracking-widest uppercase font-semibold">Course</div>
            <h2 className="text-white font-semibold text-2xl mt-1 truncate">{planet.planet.name}</h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">{planet.planet.description}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:border-neon/60 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/10 p-4">
          <div className="text-sm uppercase tracking-[0.24em] text-white/50 font-semibold">Topics</div>
          <p className="mt-2 text-sm text-white/70">Select a topic to open the full content panel and start learning.</p>
        </div>

        <div className="mt-4 flex-1 overflow-auto pr-1">
          {planet.topics.length > 0 ? (
            <div className="grid gap-3">
              {planet.topics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => onTopicSelect(topic)}
                  className="w-full rounded-3xl border border-white/10 bg-bg-1 px-4 py-4 text-left transition hover:border-neon/50 hover:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-white font-semibold">{topic.title}</div>
                      <div className="mt-1 text-sm text-white/60">{topic.category} · {topic.difficulty}</div>
                    </div>
                    <span className="text-xs text-neon">Open</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/60 line-clamp-3">{topic.description}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-black/10 p-4 text-sm text-white/70">
              No course topics are available for this planet yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
