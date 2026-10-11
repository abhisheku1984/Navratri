"use client";

/**
 * The opening experience — the "first 3 seconds" of the 3:30:3 design.
 *
 * What it is: Maa Durga at the centre of a golden mandala with the nine
 * Navadurga forms arranged around her on luminous threads. Each form is a real
 * control: arrow keys move between them, Enter opens that form's page, and the
 * nine names are the ones used everywhere else in the app, so nothing here is
 * decorative-only.
 *
 * Rules it obeys, in the order they matter:
 *  1. Never forced. A Skip control is present from the first frame, Escape
 *     skips, and the intro records that it has been seen — it will not appear
 *     again unless the reader asks for it from Settings or the home page.
 *  2. Never loud. Nothing plays on its own. The blessing is a button.
 *  3. Never motion-sick. `prefers-reduced-motion` removes the animation
 *     entirely and shows the same arrangement, static.
 *  4. Never a claim. The blessing is labelled as a devotional narration
 *     written for this app, not a scripture quotation and not a claim that the
 *     Goddess speaks through the software.
 */
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/lib/user";
import { Mandala, MotesStatic, OrnamentRule } from "./ornament";
import { ART } from "@/lib/art";
import { useReadAloud } from "./speech";
import { getLanguage, t, type LangCode } from "@/lib/i18n";
import { getBlessing, introForms } from "@/lib/intro-data";

export interface IntroForm {
  slug: string;
  day: number;
  nameDevanagari: string;
  nameTransliterated: string;
  meaning: string;
}

export interface IntroBlessing {
  text: string;
  status: string;
  disclosure: string;
  notAutoplay: string;
}

const SEEN_KEY = "navratri.intro.seen.v1";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode: the intro simply shows again, which is harmless */
  }
}

export function clearIntroSeen() {
  try {
    window.localStorage.removeItem(SEEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Triggers the intro again from anywhere, in the reader's chosen language. */
export function ReplayIntroButton({ className }: { className?: string }) {
  const { state } = useUser();
  const [shown, setShown] = useState(false);
  const lang = state.settings.language;
  const blessing = getBlessing(lang);

  if (!shown) {
    return (
      <button
        type="button"
        className={className ?? "btn btn-ghost"}
        onClick={() => setShown(true)}
      >
        \u2666 Replay the opening
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[60]">
      <NavadurgaIntro
        forms={introForms()}
        blessing={{
          text: blessing.translation.text,
          status: blessing.translation.status,
          disclosure: blessing.disclosure,
          notAutoplay: blessing.notAutoplay,
        }}
        lang={lang}
        onDone={() => setShown(false)}
        autoDismissMs={0}
        replayMode
      />
    </div>
  );
}

export function NavadurgaIntro({
  forms,
  blessing,
  lang,
  onDone,
  autoDismissMs = 16000,
  replayMode = false,
}: {
  forms: IntroForm[];
  blessing: IntroBlessing | null;
  lang: LangCode | string;
  onDone: () => void;
  autoDismissMs?: number;
  replayMode?: boolean;
}) {
  const def = getLanguage(lang);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [blessingOpen, setBlessingOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  const list = forms.length ? forms : FALLBACK_FORMS;
  const blessingText = blessing?.text ?? "";

  const finish = useCallback(() => {
    markIntroSeen();
    onDone();
  }, [onDone]);

  /* Reduced motion is read from the system, not guessed from the device. */
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  /* Keyboard: move between forms, open one, or leave. Focus is moved into the
     dialog so a keyboard user is never left behind the overlay. */
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % list.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + list.length) % list.length);
      }
    };
    const host = hostRef.current;
    host?.addEventListener("keydown", onKey);
    return () => host?.removeEventListener("keydown", onKey);
  }, [finish, list.length]);

  /* The intro yields on its own so nobody is trapped in a splash screen. */
  useEffect(() => {
    if (!autoDismissMs) return;
    const id = window.setTimeout(finish, autoDismissMs);
    return () => window.clearTimeout(id);
  }, [autoDismissMs, finish]);

  const nodes = useMemo(
    () =>
      list.map((f, i) => {
        const angle = (i / list.length) * Math.PI * 2 - Math.PI / 2;
        return { ...f, x: 50 + Math.cos(angle) * 37, y: 50 + Math.sin(angle) * 37, angle };
      }),
    [list],
  );

  return (
    <div
      ref={hostRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${t(lang, "intro.title")} — ${t(lang, "intro.subtitle")}`}
      dir={def.dir}
      lang={def.code}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "radial-gradient(circle at 50% 42%, #3a0d10 0%, #21060a 55%, #140408 100%)" }}
    >
      {/* golden light and mandala field ------------------------------------ */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[125vmin] w-[125vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.2]"
          style={{ animation: reduced ? undefined : "intro-spin 120s linear infinite" }}
        >
          <Mandala className="h-full w-full" petals={24} stroke="#e8c86a" />
        </div>
        <div
          className="absolute left-1/2 top-1/2 h-[86vmin] w-[86vmin] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
          style={{ animation: reduced ? undefined : "intro-spin-rev 90s linear infinite" }}
        >
          <Mandala className="h-full w-full" petals={16} stroke="#f0a03a" />
        </div>
        <MotesStatic count={22} />
      </div>

      {/* controls --------------------------------------------------------- */}
      <div className="relative z-20 flex items-center justify-between gap-3 p-4 sm:p-6">
        <p className="muted text-[0.68rem] uppercase tracking-[0.28em]" style={{ color: "#c9a227" }}>
          {t(lang, "app.subtitle")}
        </p>
        <div className="flex items-center gap-2">
          {blessing && (
            <button
              type="button"
              className="rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(232,200,106,0.5)", color: "#e8c86a" }}
              aria-expanded={blessingOpen}
              onClick={() => setBlessingOpen((v) => !v)}
            >
              ♪ {t(lang, "intro.playBlessing")}
            </button>
          )}
          <button ref={closeRef} type="button" onClick={finish} className="btn btn-ghost !py-1.5 !px-3 text-xs"
                  style={{ borderColor: "rgba(232,200,106,0.5)", color: "#e8c86a" }}>
            {replayMode ? "Close" : t(lang, "app.skipIntro")} →
          </button>
        </div>
      </div>

      {/* the arrangement -------------------------------------------------- */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="relative h-[min(78vh,700px)] w-[min(92vw,700px)]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <linearGradient id="thread" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8c86a" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#f0a03a" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            {nodes.map((n, i) => (
              <line
                key={n.slug}
                x1="50" y1="50" x2={n.x} y2={n.y}
                stroke="url(#thread)"
                strokeWidth={i === active ? 0.6 : 0.28}
                strokeDasharray="1.6 1.2"
                style={{ animation: reduced ? undefined : "intro-dash 2.6s linear infinite" }}
              />
            ))}
            <circle cx="50" cy="50" r="37" fill="none" stroke="#c9a227" strokeOpacity="0.35" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#c9a227" strokeOpacity="0.22" strokeWidth="0.16" />
          </svg>

          {/* Maa Durga at the centre */}
          <div className="absolute left-1/2 top-1/2 h-[38%] w-[38%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
               style={{ boxShadow: "0 0 80px 18px rgba(201,162,39,0.28)", border: "1px solid rgba(232,200,106,0.4)" }}>
            <Image
              src={ART.hero}
              alt="Maa Durga, the Divine Shakti, at the centre of the mandala"
              width={520}
              height={520}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          {/* the nine forms */}
          <ul className="absolute inset-0">
            {nodes.map((n, i) => (
              <li
                key={n.slug}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
              >
                <Link
                  href={`/navadurga/${n.slug}`}
                  onFocus={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="group flex h-[5.4rem] w-[5.4rem] flex-col items-center justify-center gap-0.5 rounded-full border text-center transition-transform sm:h-[6.6rem] sm:w-[6.6rem]"
                  style={{
                    borderColor: i === active ? "#e8c86a" : "rgba(232,200,106,0.34)",
                    background: i === active ? "rgba(232,200,106,0.14)" : "rgba(20,4,8,0.55)",
                    backdropFilter: "blur(3px)",
                    transform: i === active ? "scale(1.06)" : undefined,
                  }}
                  aria-label={`Day ${n.day}: ${n.nameTransliterated} — ${n.meaning}`}
                >
                  <span className="deva text-[0.95rem] font-semibold leading-tight sm:text-lg"
                        style={{ color: "#fdfbf4" }}>
                    {n.nameDevanagari}
                  </span>
                  <span className="text-[0.58rem] leading-tight" style={{ color: "#d8c8a8" }}>
                    {t(lang, "nd.day")} {n.day}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* words ------------------------------------------------------------ */}
      <div className="relative z-10 px-6 pb-5">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="display text-2xl font-semibold sm:text-4xl" style={{ color: "#fdfbf4" }}>
            {t(lang, "app.name")}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[0.3em]" style={{ color: "#c9a227" }}>
            {t(lang, "intro.subtitle")}
          </p>
          <p className="mt-3 text-sm" style={{ color: "#d8c8a8" }}>
            <span className="deva font-semibold" style={{ color: "#e8c86a" }}>
              {nodes[active]?.nameDevanagari}
            </span>
            {" · "}
            {nodes[active]?.nameTransliterated} — {nodes[active]?.meaning}
          </p>
          <p className="muted mt-2 text-[0.66rem]" style={{ color: "#a9946f" }}>
            {t(lang, "intro.hint")} · {active + 1} {t(lang, "intro.ofNine")}
            {reduced ? ` · ${t(lang, "intro.motionReduced")}` : ""}
          </p>

          {blessingOpen && blessing && (
            <div className="mt-4 rounded-2xl border p-4 text-start"
                 style={{ borderColor: "rgba(232,200,106,0.35)", background: "rgba(20,4,8,0.6)" }}>
              <p className="deva text-sm leading-relaxed" style={{ color: "#fdfbf4" }}>
                {blessingText}
              </p>
              <p className="mt-2 text-[0.68rem] leading-relaxed" style={{ color: "#a9946f" }}>
                {blessing.disclosure}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BlessingPlay text={blessingText} lang={String(lang)} />
                <span className="text-[0.66rem]" style={{ color: "#a9946f" }}>
                  {blessing.notAutoplay}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link href="/navadurga" className="btn btn-primary">{t(lang, "action.startJourney")}</Link>
            <Link href="/" onClick={finish} className="btn btn-ghost"
                  style={{ borderColor: "rgba(232,200,106,0.45)", color: "#e8c86a" }}>
              {t(lang, "app.enter")}
            </Link>
          </div>
        </div>
        <OrnamentRule className="mx-auto mt-4 max-w-lg opacity-50" />
      </div>

      <style>{`
        @keyframes intro-spin { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes intro-spin-rev { to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes intro-dash { to { stroke-dashoffset: -5.6; } }
        @media (prefers-reduced-motion: reduce) {
          .intro-spin, .intro-spin-rev { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/**
 * The blessing, spoken with the device's own voice in the selected language.
 *
 * Voice substitution is disclosed by the player itself: Sanskrit is read with a
 * Hindi voice where that is all the device has, and the label says so. If the
 * device has no voice for the language, the button refuses and says why instead
 * of reading Assamese text in an English accent.
 */
function BlessingPlay({ text, lang }: { text: string; lang: string }) {
  const { supported, speaking, toggle } = useReadAloud(text, lang);
  const def = getLanguage(lang);
  const [voiceState, setVoiceState] = useState<"unknown" | "ok" | "substitute" | "none">("unknown");

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceState("none");
      return;
    }
    const read = () => {
      const all = window.speechSynthesis.getVoices();
      const primary = def.bcp47.split("-")[0].toLowerCase();
      const exact = all.some((v) => (v.lang || "").toLowerCase().replace("_", "-") === def.bcp47.toLowerCase());
      const same = all.some((v) => (v.lang || "").toLowerCase().split("-")[0] === primary);
      if (exact) setVoiceState("ok");
      else if (same) setVoiceState("ok");
      else if (def.code === "sa" || def.code === "ks" || def.code === "sd") setVoiceState("substitute");
      else setVoiceState(all.length ? "none" : "none");
    };
    read();
    window.speechSynthesis.addEventListener?.("voiceschanged", read);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", read);
  }, [def.bcp47, def.code]);

  if (!supported) {
    return (
      <span className="text-[0.68rem]" style={{ color: "#a9946f" }}>
        This device has no speech engine, so the blessing stays as text here.
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={speaking}
        className="rounded-full border px-3 py-1.5 text-xs font-semibold"
        style={{ borderColor: "rgba(232,200,106,0.5)", color: "#e8c86a" }}
      >
        {speaking ? `■ ${t(lang, "action.stop")}` : `▶ ${t(lang, "action.listen")}`}
      </button>
      <span className="text-[0.64rem]" style={{ color: "#a9946f" }}>
        {voiceState === "ok" && `device ${def.native} voice`}
        {voiceState === "substitute" && `no native ${def.label} voice here — a related voice is used and labelled`}
        {voiceState === "none" && `no ${def.label} voice installed on this device — text only`}
        {" · "}{t(lang, "audio.deviceVoice")}
      </span>
    </span>
  );
}

/** Used only when the server hands the intro no forms at all (should not happen). */
const FALLBACK_FORMS: IntroForm[] = [
  { slug: "shailaputri", day: 1, nameDevanagari: "शैलपुत्री", nameTransliterated: "Śailaputrī", meaning: "Daughter of the mountain" },
  { slug: "brahmacharini", day: 2, nameDevanagari: "ब्रह्मचारिणी", nameTransliterated: "Brahmacāriṇī", meaning: "The one who walks in discipline" },
  { slug: "chandraghanta", day: 3, nameDevanagari: "चन्द्रघण्टा", nameTransliterated: "Candraghaṇṭā", meaning: "Bearing the crescent bell" },
  { slug: "kushmanda", day: 4, nameDevanagari: "कूष्माण्डा", nameTransliterated: "Kūṣmāṇḍā", meaning: "The one whose smile brought forth the world" },
  { slug: "skandamata", day: 5, nameDevanagari: "स्कन्दमाता", nameTransliterated: "Skandamātā", meaning: "Mother of Skanda" },
  { slug: "katyayani", day: 6, nameDevanagari: "कात्यायनी", nameTransliterated: "Kātyāyanī", meaning: "Daughter of sage Katyayana" },
  { slug: "kalaratri", day: 7, nameDevanagari: "कालरात्रि", nameTransliterated: "Kālarātri", meaning: "Dark night" },
  { slug: "mahagauri", day: 8, nameDevanagari: "महागौरी", nameTransliterated: "Mahāgaurī", meaning: "Radiantly fair" },
  { slug: "siddhidatri", day: 9, nameDevanagari: "सिद्धिदात्री", nameTransliterated: "Siddhidātrī", meaning: "Giver of attainments" },
];
