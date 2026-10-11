"use client";

/**
 * Local user state: settings, bookmarks, reading progress, journal, favourites
 * and the pilgrimage itinerary.
 *
 * Persisted to localStorage. Nothing is sent anywhere — there is no account
 * system and no analytics in this build. The store is deliberately shaped like
 * the `user_*` tables in db/schema.sql so a sync adapter can be dropped in
 * later without changing call sites.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type {
  Bookmark, ItineraryStop, JournalEntry, ReviewVerdict, UserSettings, UserState,
} from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

const KEY = "navratri.state.v1";

const EMPTY: UserState = {
  settings: DEFAULT_SETTINGS,
  bookmarks: [],
  progress: { scripture: {}, chapters: {}, completed: [] },
  recitations: [],
  journal: [],
  quizScores: {},
  favourites: { peethas: [], temples: [] },
  itinerary: [],
  reviewVerdicts: {},
};

function load(): UserState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<UserState>;
    return {
      ...EMPTY,
      ...parsed,
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
      progress: { ...EMPTY.progress, ...(parsed.progress ?? {}) },
      favourites: { ...EMPTY.favourites, ...(parsed.favourites ?? {}) },
      // Saved state from before the planner existed has no itinerary.
      itinerary: Array.isArray(parsed.itinerary) ? parsed.itinerary : [],
      reviewVerdicts:
        parsed.reviewVerdicts && typeof parsed.reviewVerdicts === "object"
          ? parsed.reviewVerdicts
          : {},
    };
  } catch {
    return EMPTY;
  }
}

interface Ctx {
  state: UserState;
  hydrated: boolean;
  setSettings: (patch: Partial<UserSettings>) => void;
  toggleBookmark: (b: Omit<Bookmark, "id" | "createdAt">) => void;
  isBookmarked: (href: string) => boolean;
  setChapterProgress: (chapterId: string, ratio: number) => void;
  setVerseRead: (chapterId: string, label: string) => void;
  logRecitation: (chapterId: string) => void;
  addJournal: (text: string, gratitude?: string) => void;
  removeJournal: (id: string) => void;
  recordQuiz: (id: string, correct: number, total: number) => void;
  toggleFavourite: (kind: "peethas" | "temples", id: string) => void;
  isFavourite: (kind: "peethas" | "temples", id: string) => boolean;
  /** Replace the whole itinerary. Used by reorder and clear. */
  setItinerary: (stops: ItineraryStop[]) => void;
  /** Append a stop, or remove it if already present. */
  toggleItineraryStop: (stop: ItineraryStop) => void;
  isInItinerary: (id: string) => boolean;
  /** Move a stop one place earlier or later in the order. */
  moveItineraryStop: (id: string, direction: -1 | 1) => void;
  /** Record a review verdict. Latest verdict for a record wins. */
  setReviewVerdict: (v: ReviewVerdict) => void;
  clearReviewVerdict: (recordId: string) => void;
  resetAll: () => void;
  exportState: () => string;
}

const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — the app keeps working in-memory */
    }
  }, [state, hydrated]);

  const setSettings = useCallback((patch: Partial<UserSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const toggleBookmark = useCallback((b: Omit<Bookmark, "id" | "createdAt">) => {
    setState((s) => {
      const existing = s.bookmarks.find((x) => x.href === b.href && x.ref === b.ref);
      if (existing) return { ...s, bookmarks: s.bookmarks.filter((x) => x !== existing) };
      const next: Bookmark = { ...b, id: `${b.kind}:${b.ref}:${Date.now()}`, createdAt: Date.now() };
      return { ...s, bookmarks: [next, ...s.bookmarks].slice(0, 500) };
    });
  }, []);

  const isBookmarked = useCallback(
    (href: string) => state.bookmarks.some((b) => b.href === href),
    [state.bookmarks],
  );

  const setChapterProgress = useCallback((chapterId: string, ratio: number) => {
    setState((s) => ({
      ...s,
      progress: {
        ...s.progress,
        chapters: { ...s.progress.chapters, [chapterId]: ratio },
        completed:
          ratio >= 1 && !s.progress.completed.includes(chapterId)
            ? [...s.progress.completed, chapterId]
            : s.progress.completed,
      },
    }));
  }, []);

  const setVerseRead = useCallback((chapterId: string, label: string) => {
    setState((s) => ({
      ...s,
      progress: { ...s.progress, scripture: { ...s.progress.scripture, [chapterId]: label } },
    }));
  }, []);

  const logRecitation = useCallback((chapterId: string) => {
    setState((s) => ({ ...s, recitations: [{ chapterId, at: Date.now() }, ...s.recitations].slice(0, 500) }));
  }, []);

  const addJournal = useCallback((text: string, gratitude?: string) => {
    const entry: JournalEntry = {
      id: `j-${Date.now()}`,
      date: new Date().toISOString(),
      text,
      gratitude,
    };
    setState((s) => ({ ...s, journal: [entry, ...s.journal] }));
  }, []);

  const removeJournal = useCallback((id: string) => {
    setState((s) => ({ ...s, journal: s.journal.filter((j) => j.id !== id) }));
  }, []);

  const recordQuiz = useCallback((id: string, correct: number, total: number) => {
    setState((s) => ({ ...s, quizScores: { ...s.quizScores, [id]: { correct, total, at: Date.now() } } }));
  }, []);

  const toggleFavourite = useCallback((kind: "peethas" | "temples", id: string) => {
    setState((s) => {
      const list = s.favourites[kind];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...s, favourites: { ...s.favourites, [kind]: next } };
    });
  }, []);

  const isFavourite = useCallback(
    (kind: "peethas" | "temples", id: string) => state.favourites[kind].includes(id),
    [state.favourites],
  );

  const setItinerary = useCallback((stops: ItineraryStop[]) => {
    setState((s) => ({ ...s, itinerary: stops }));
  }, []);

  const toggleItineraryStop = useCallback((stop: ItineraryStop) => {
    setState((s) => {
      const present = s.itinerary.some((x) => x.id === stop.id);
      return {
        ...s,
        itinerary: present
          ? s.itinerary.filter((x) => x.id !== stop.id)
          // Cap the list so localStorage cannot grow without bound.
          : [...s.itinerary, stop].slice(0, 100),
      };
    });
  }, []);

  const isInItinerary = useCallback(
    (id: string) => state.itinerary.some((x) => x.id === id),
    [state.itinerary],
  );

  const moveItineraryStop = useCallback((id: string, direction: -1 | 1) => {
    setState((s) => {
      const idx = s.itinerary.findIndex((x) => x.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= s.itinerary.length) return s;
      const next = [...s.itinerary];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...s, itinerary: next };
    });
  }, []);

  const setReviewVerdict = useCallback((v: ReviewVerdict) => {
    setState((s) => ({
      ...s,
      reviewVerdicts: { ...s.reviewVerdicts, [v.recordId]: v },
    }));
  }, []);

  const clearReviewVerdict = useCallback((recordId: string) => {
    setState((s) => {
      if (!(recordId in s.reviewVerdicts)) return s;
      const next = { ...s.reviewVerdicts };
      delete next[recordId];
      return { ...s, reviewVerdicts: next };
    });
  }, []);

  const resetAll = useCallback(() => setState(EMPTY), []);
  const exportState = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const value = useMemo<Ctx>(() => ({
    state, hydrated, setSettings, toggleBookmark, isBookmarked, setChapterProgress,
    setVerseRead, logRecitation, addJournal, removeJournal, recordQuiz,
    toggleFavourite, isFavourite, setItinerary, toggleItineraryStop,
    isInItinerary, moveItineraryStop, setReviewVerdict, clearReviewVerdict,
    resetAll, exportState,
  }), [state, hydrated, setSettings, toggleBookmark, isBookmarked, setChapterProgress,
       setVerseRead, logRecitation, addJournal, removeJournal, recordQuiz,
       toggleFavourite, isFavourite, setItinerary, toggleItineraryStop,
       isInItinerary, moveItineraryStop, setReviewVerdict, clearReviewVerdict,
       resetAll, exportState]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): Ctx {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}

/** Applies the user's visual settings to <html>. Safe to call on every render. */
export function useApplySettings() {
  const { state, hydrated } = useUser();
  const s = state.settings;
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const dark =
      s.theme === "dark" ||
      (s.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "dark" : "light";
    root.dataset.contrast = s.contrast;
    const reduce =
      s.motion === "reduced" ||
      (s.motion === "auto" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    root.dataset.motion = reduce ? "reduced" : "full";
    root.style.setProperty("--text-scale", String(s.textScale));
    root.style.setProperty("--verse-scale", String(s.verseScale));
    root.style.setProperty("--verse-line", String(s.verseLine));
    root.lang = s.language === "sa" ? "sa" : s.language;
  }, [hydrated, s]);
}
