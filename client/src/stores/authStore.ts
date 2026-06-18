import { create } from "zustand";
import { api } from "../lib/api";

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  completedTopics: string[];
  progressByPlanet: Record<string, number>;
  lastActiveAt: string | Date;
};

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  user: UserDTO | null;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  accessToken: null,
  user: null,

  init: async () => {
    const { status } = get();
    if (status === "loading") return;
    set({ status: "loading" });
    try {
      await get().refresh();
    } catch {
      set({ status: "unauthenticated", accessToken: null, user: null });
    }
  },

  refresh: async () => {
    // Uses refresh token cookie (httpOnly). Access token is returned.
    const res = await api.post<{ accessToken: string }>("/auth/refresh");
    set({ accessToken: res.accessToken, status: "authenticated" });

    const me = await api.get<{ user: UserDTO }>("/auth/me", res.accessToken);
    set({ user: me.user });
  },

  login: async (email, password) => {
    set({ status: "loading" });
    const res = await api.post<{ accessToken: string; user: Omit<UserDTO, "progressByPlanet" | "completedTopics" | "lastActiveAt"> }>(
      "/auth/login",
      { email, password }
    );
    set({ accessToken: res.accessToken, status: "authenticated" });

    const me = await api.get<{ user: UserDTO }>("/auth/me", res.accessToken);
    set({ user: me.user });
  },

  signup: async (name, email, password) => {
    set({ status: "loading" });
    await api.post<{ user: { id: string; name: string; email: string } }>("/auth/signup", { name, email, password });
    // After signup, encourage login; keep refresh-based init for subsequent calls.
    set({ status: "unauthenticated", accessToken: null, user: null });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      // ignore
    } finally {
      set({ accessToken: null, user: null, status: "unauthenticated" });
    }
  },
}));

