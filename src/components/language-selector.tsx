"use client";

/**
 * The language selector — the single most important control in the app.
 *
 * Requirements it answers to:
 *  - all 24 languages, each shown in its own script, never in English alone;
 *  - the translation status of each language visible *before* choosing it
 *    (percentage of interface strings, review state, voice availability), so
 *    nobody switches to Kannada expecting a translated article and finds
 *    English prose labelled "Kannada";
 *  - a searchable list, because 24 items in native scripts is a lot to scan;
 *  - right-to-left languages previewed right-to-left in their own row;
 *  - keyboard operable and screen-reader labelled;
 *  - persists through the user store, which already keeps the choice locally.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LANGUAGES, coverage, isRtl, translationStatus, type LanguageDef,
} from "@/lib/i18n";
import { useUser } from "@/lib/user";

interface VoiceInfo {
  available: boolean;
  voiceName: string | null;
  /** Set when the only match was a related language, e.g. Urdu for Sindhi. */
  substituted: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  complete: "Complete",
  substantial: "Substantial",
  partial: "Partial",
  minimal: "Minimal",
  none: "Not started",
};

/** Match a language by code, English label, endonym, or a partial type-in. */
export function filterLanguages(query: string, list: LanguageDef[] = LANGUAGES): LanguageDef[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (l) =>
      l.code.includes(q) ||
      l.label.toLowerCase().includes(q) ||
      l.native.toLowerCase().includes(q) ||
      l.bcp47.toLowerCase().includes(q),
  );
}

export function LanguageSelector({
  variant = "inline",
  onDone,
}: {
  variant?: "inline" | "dialog";
  onDone?: () => void;
}) {
  const { state, setSettings } = useUser();
  const [query, setQuery] = useState("");
  const [voices, setVoices] = useState<VoiceInfo[]>([
    { available: false, voiceName: null, substituted: null },
  ]);
  const firstRef = useRef<HTMLButtonElement>(null);

  /**
   * Ask the device what voices it has. Deliberately a one-shot read: the voice
   * list is browser-owned, changes late on some platforms, and must never be
   * reported as available before it has actually been read.
   */
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const read = () => {
      const all = window.speechSynthesis.getVoices();
      setVoices(
        LANGUAGES.map((l) => {
          const primary = l.bcp47.split("-")[0].toLowerCase();
          const exact = all.find(
            (v) => (v.lang || "").toLowerCase().replace("_", "-") === l.bcp47.toLowerCase(),
          );
          const same = all.find(
            (v) => (v.lang || "").toLowerCase().split("-")[0] === primary,
          );
          const match = exact ?? same ?? null;
          return {
            available: Boolean(match),
            voiceName: match?.name ?? null,
            // Sanskrit, Kashmiri and Sindhi commonly resolve to a neighbour
            // language's voice. Say so rather than implying a native voice.
            substituted:
              match && l.code === "sa" ? "Hindi" :
              match && (l.code === "ks" || l.code === "sd") && !exact ? "Urdu" : null,
          };
        }),
      );
    };
    read();
    window.speechSynthesis.addEventListener?.("voiceschanged", read);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", read);
  }, []);

  const visible = useMemo(() => filterLanguages(query), [query]);

  useEffect(() => {
    if (variant === "dialog") firstRef.current?.focus();
  }, [variant]);

  const choose = (code: string) => {
    setSettings({ language: code as typeof state.settings.language });
    onDone?.();
  };

  return (
    <div className={variant === "dialog" ? "p-1" : ""}>
      {variant === "dialog" && (
        <p className="muted mb-3 text-xs leading-relaxed">
          24 languages. The figure beside each name is how much of the interface is
          translated; articles and narration are counted separately on the page itself.
        </p>
      )}

      <label className="sr-only" htmlFor="lang-filter">
        Filter languages
      </label>
      <input
        id="lang-filter"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search languages · भाषा खोजें · భాష వెతకండి"
        className="mb-3 w-full rounded-xl border px-3 py-2 text-sm outline-none"
        style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)" }}
      />

      {visible.length === 0 && (
        <p className="muted px-1 py-4 text-sm">
          No language matched “{query}”.
        </p>
      )}

      <ul className="grid max-h-[60vh] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {visible.map((l, i) => {
          const cov = coverage(l.code);
          const status = translationStatus(l.code);
          const active = state.settings.language === l.code;
          const voice = voices.find((v) => v.voiceName !== undefined) && voices[LANGUAGES.indexOf(l)];
          return (
            <li key={l.code}>
              <button
                ref={i === 0 ? firstRef : undefined}
                type="button"
                onClick={() => choose(l.code)}
                aria-pressed={active}
                dir={l.dir}
                lang={l.code}
                className="w-full rounded-xl border px-3 py-2.5 text-start transition-colors"
                style={{
                  borderColor: active ? "var(--gold)" : "var(--line)",
                  background: active ? "var(--accent-soft)" : "transparent",
                }}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold" style={{ fontFamily: l.fontStack }}>
                    {l.native}
                  </span>
                  <span className="muted text-[0.68rem]" dir="ltr">{l.code}</span>
                </span>
                <span className="muted mt-0.5 block text-[0.7rem]" dir="ltr">
                  {l.label} · UI {cov.pct}% · {STATUS_LABEL[status]}
                  {voice?.available
                    ? voice.substituted
                      ? ` · ${voice.substituted} voice`
                      : " · voice ✓"
                    : " · no voice"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="muted mt-3 text-[0.7rem] leading-relaxed">
        Right-to-left languages ({LANGUAGES.filter((l) => isRtl(l.code)).map((l) => l.native).join(", ")}) switch
        the whole layout direction. Fonts for each script are listed in Settings.
      </p>
    </div>
  );
}

/** A compact header control: a select on wide screens, a button on phones. */
export function LanguageMenuButton({ onOpen }: { onOpen: () => void }) {
  const { state } = useUser();
  const current = LANGUAGES.find((l) => l.code === state.settings.language) ?? LANGUAGES[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="btn btn-ghost shrink-0 !px-2.5 !py-1.5 text-xs"
      aria-label={`Language: ${current.label}. Change language`}
      lang={current.code}
    >
      <span aria-hidden="true">◍</span>
      <span className="hidden sm:inline" style={{ fontFamily: current.fontStack }}>
        {current.native}
      </span>
    </button>
  );
}
