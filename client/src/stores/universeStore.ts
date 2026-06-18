import { create } from "zustand";
import { api } from "../lib/api";

export type TopicDTO = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  content: string;
  code: string;
  visualization: { type: string; config: Record<string, any> };
  quiz: Array<{
    question: string;
    options: string[];
    answerIndex: number;
    explanation?: string;
  }>;
};

export type PlanetDTO = {
  id: string;
  name: string;
  slug: string;
  description: string;
  themeColor: string;
};

export type UniversePlanet = {
  planet: PlanetDTO;
  topics: TopicDTO[];
};

type UniverseState = {
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  planets: UniversePlanet[];
  selectedPlanetSlug: string | null;
  selectedTopic: TopicDTO | null;
  loadPlanets: () => Promise<void>;
  selectPlanet: (slug: string | null) => void;
  selectTopic: (topic: TopicDTO) => void;
  clearSelection: () => void;
};

export const useUniverseStore = create<UniverseState>((set) => ({
  status: "idle",
  error: null,
  planets: [],
  selectedPlanetSlug: null,
  selectedTopic: null,

  loadPlanets: async () => {
    set({ status: "loading", error: null });
    try {
      const res = await api.get<{ planets: UniversePlanet[] }>("/planets");
      set({ planets: res.planets, status: "ready" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load the galaxy.";
      set({ status: "error", error: message });
      throw err;
    }
  },

  selectPlanet: (slug) => set({ selectedPlanetSlug: slug, selectedTopic: null }),
  selectTopic: (topic) => set({ selectedTopic: topic }),
  clearSelection: () => set({ selectedPlanetSlug: null, selectedTopic: null }),
}));

