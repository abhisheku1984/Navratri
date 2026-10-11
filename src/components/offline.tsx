"use client";

/**
 * Offline / PWA glue.
 *
 * The service worker (public/sw.js) is registered only when the reader has
 * switched "offline reading" on in settings. That keeps the default experience
 * a plain server-rendered site — no worker intercepting anything — and makes
 * offline a deliberate choice, as the brief's "selected offline" implies.
 *
 * What this can and cannot guarantee:
 *
 *   - It can register the worker, report live online/offline state, and pin or
 *     drop specific pages in the worker's cache.
 *   - It cannot promise that a pinned page will render offline forever: a page
 *     whose markup changes and whose hashed JS chunks rotate needs those chunks
 *     cached too, and the worker caches them on first use. Pinning while online
 *     and opening the page once is the reliable path, and the UI says so.
 *
 * Browsers without service-worker support get a quiet no-op; the app remains
 * fully usable online, which is the existing behaviour.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUser } from "@/lib/user";

interface OfflineCtx {
  /** Whether the browser even supports a service worker. */
  supported: boolean;
  /** Whether offline mode is switched on in settings. */
  enabled: boolean;
  /** Whether the worker actually registered and is controlling this page. */
  active: boolean;
  /** Live network state. */
  online: boolean;
  /** Pages the worker currently has cached for offline use. */
  cachedPaths: string[];
  /** Pin one or more same-origin paths for offline reading. */
  pin: (paths: string[]) => void;
  /** Drop paths from the offline cache. */
  unpin: (paths: string[]) => void;
  refresh: () => void;
}

const Ctx = createContext<OfflineCtx | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { state } = useUser();
  const enabled = state.settings.offline;

  const supported =
    typeof window !== "undefined" && "serviceWorker" in navigator;

  const [active, setActive] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const [cachedPaths, setCachedPaths] = useState<string[]>([]);

  /* Track live connectivity. */
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  /* Register or unregister based on the setting. */
  useEffect(() => {
    if (!supported) return;

    if (enabled) {
      let cancelled = false;
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => {
          if (!cancelled) setActive(true);
        })
        .catch(() => {
          if (!cancelled) setActive(false);
        });

      const onChanged = () => refresh();
      navigator.serviceWorker.addEventListener("message", onChanged);
      return () => {
        cancelled = true;
        navigator.serviceWorker.removeEventListener("message", onChanged);
      };
    }

    // Offline switched off: unregister so nothing keeps intercepting.
    setActive(false);
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => undefined);
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, supported]);

  const post = useCallback(
    (message: Record<string, unknown>) => {
      if (!supported) return;
      const ctrl =
        navigator.serviceWorker.controller ??
        navigator.serviceWorker.getRegistration().then((r) => r?.active);
      if (ctrl instanceof Promise) {
        ctrl.then((sw) => sw?.postMessage(message)).catch(() => undefined);
      } else {
        ctrl?.postMessage(message);
      }
    },
    [supported],
  );

  const refresh = useCallback(() => {
    if (!supported) return;
    post({ type: "CACHED_LIST" });
  }, [post, supported]);

  useEffect(() => {
    if (!supported) return;
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "CACHED_LIST" && Array.isArray(e.data.paths)) {
        setCachedPaths(e.data.paths);
      }
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, [supported]);

  const pin = useCallback(
    (paths: string[]) => {
      post({ type: "CACHE_URLS", urls: paths });
      // Give the worker a beat to finish, then re-list.
      setTimeout(refresh, 250);
    },
    [post, refresh],
  );

  const unpin = useCallback(
    (paths: string[]) => {
      post({ type: "CACHE_DROP", urls: paths });
      setTimeout(refresh, 250);
    },
    [post, refresh],
  );

  const value = useMemo<OfflineCtx>(
    () => ({ supported, enabled, active, online, cachedPaths, pin, unpin, refresh }),
    [supported, enabled, active, online, cachedPaths, pin, unpin, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * A quiet connectivity chip for the top bar.
 *
 * It only appears when it has something to say: the reader is offline (so they
 * know they are reading cached pages), or offline mode is actively pinning. It
 * says nothing when everything is normal, so the top bar is not cluttered.
 */
export function OfflineStatusChip() {
  const { online, enabled, active } = useOffline();
  const { hydrated } = useUser();

  // Server and first client render agree by drawing nothing pre-hydration.
  if (!hydrated) return null;

  if (!online) {
    return (
      <span
        role="status"
        className="shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
        style={{ borderColor: "var(--maroon-400)", color: "var(--maroon-500)" }}
      >
        Offline
      </span>
    );
  }

  if (enabled && active) {
    return (
      <span
        aria-label="Offline reading is on"
        className="shrink-0 rounded-full border px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
        style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}
      >
        Offline-ready
      </span>
    );
  }

  return null;
}

/**
 * A button that pins (or drops) one same-origin path in the offline cache.
 *
 * Rendered inside server components so any page can offer offline reading
 * without becoming a client component. When offline mode is off it explains
 * itself rather than silently doing nothing.
 */
export function OfflinePinButton({ path, label }: { path: string; label: string }) {
  const { supported, enabled, active, cachedPaths, pin, unpin } = useOffline();
  const { hydrated } = useUser();
  const pinned = cachedPaths.includes(path);

  // Window-dependent, so only drawn after hydration to match the server.
  if (!hydrated) return null;
  if (!supported) return null;

  if (!enabled) {
    return (
      <p className="muted text-xs leading-relaxed">
        Offline reading is off. Turn it on in{" "}
        <a href="/settings" className="link-underline">Settings</a> to pin{" "}
        {label} for reading without a connection.
      </p>
    );
  }

  if (!active) {
    return <p className="muted text-xs">Starting offline mode…</p>;
  }

  return (
    <button
      type="button"
      onClick={() => (pinned ? unpin([path]) : pin([path]))}
      aria-pressed={pinned}
      className={`w-full rounded-full border px-4 py-2 text-sm transition-colors ${
        pinned
          ? "border-[color:var(--gold)] bg-[color:var(--gold-soft)]"
          : "border-[color:var(--line-strong)] hover:border-[color:var(--gold)]"
      }`}
    >
      {pinned ? `✓ Pinned for offline — ${label}` : `Pin ${label} for offline`}
    </button>
  );
}

export function useOffline(): OfflineCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Offline features are optional; a consumer outside the provider simply
    // sees them as unavailable rather than crashing the page.
    return {
      supported: false,
      enabled: false,
      active: false,
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      cachedPaths: [],
      pin: () => undefined,
      unpin: () => undefined,
      refresh: () => undefined,
    };
  }
  return ctx;
}
