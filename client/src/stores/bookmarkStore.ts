import { create } from "zustand";

const STORAGE_KEY = "universe_bookmarks_v1";

type BookmarkState = {
  topicIds: string[];
  isBookmarked: (topicId: string) => boolean;
  toggleBookmark: (topicId: string) => void;
  load: () => void;
};

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  topicIds: [],
  isBookmarked: (topicId) => get().topicIds.includes(topicId),
  toggleBookmark: (topicId) => {
    set((s) => {
      const exists = s.topicIds.includes(topicId);
      const next = exists ? s.topicIds.filter((id) => id !== topicId) : [...s.topicIds, topicId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return { topicIds: next };
    });
  },
  load: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) set({ topicIds: arr.map(String) });
    } catch {
      // ignore
    }
  },
}));

