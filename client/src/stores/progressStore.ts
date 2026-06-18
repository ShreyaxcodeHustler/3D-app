import { create } from "zustand";
import { api } from "../lib/api";
import { useAuthStore } from "./authStore";
import type { TopicDTO } from "./universeStore";

export type ProgressDTO = {
  topicId: string;
  status: "in_progress" | "completed";
  lastStepIndex: number;
  attempts: number;
  completedAt: string | Date | null;
  topic: TopicDTO & { planet?: { slug: string; name: string } | null };
};

type ProgressState = {
  status: "idle" | "loading" | "ready" | "error";
  completedTopicIds: string[];
  progressByPlanet: Record<string, number>;
  progresses: ProgressDTO[];
  load: () => Promise<void>;
  markComplete: (topicId: string) => Promise<void>;
  upsertProgress: (topicId: string, payload: Partial<{ status: "in_progress" | "completed"; lastStepIndex: number; attempts: number }>) => Promise<void>;
};

export const useProgressStore = create<ProgressState>((set) => ({
  status: "idle",
  completedTopicIds: [],
  progressByPlanet: {},
  progresses: [],

  load: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    set({ status: "loading" });
    const res = await api.get<{
      completedTopicIds: string[];
      progressByPlanet: Record<string, number>;
      progresses: ProgressDTO[];
    }>("/progress", accessToken);
    set({
      status: "ready",
      completedTopicIds: res.completedTopicIds.map(String),
      progressByPlanet: res.progressByPlanet || {},
      progresses: res.progresses || [],
    });
  },

  markComplete: async (topicId) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    await api.post(`/progress/${topicId}/complete`, {}, accessToken);
    await useProgressStore.getState().load();
  },

  upsertProgress: async (topicId, payload) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;
    await api.post(`/progress/${topicId}`, payload, accessToken);
    await useProgressStore.getState().load();
  },
}));

