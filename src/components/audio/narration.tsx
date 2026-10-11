"use client";

/**
 * The narration player.
 *
 * Real controls, real state, no decoration:
 *  - play / pause / resume / stop / replay
 *  - 0.75× · 1× · 1.25× · 1.5×
 *  - volume
 *  - a progress indicator and a seek control that actually seek, by sentence
 *  - sentence captions, and a full transcript whose lines are clickable
 *  - voice selection when the device offers more than one suitable voice
 *  - keyboard operable throughout, with a visible focus ring and labelled
 *    controls
 *
 * What it will not do, and says so: read one language's text with another
 * language's voice. Where a recorded recitation would go, it explains that no
 * recording ships because recitation is a rights-holder's performance. Where
 * the device has no voice for the chosen language, the control is disabled and
 * the reason is printed — never a silent fallback to the wrong accent.
 *
 * Progress is sentence-level because that is the only truthful granularity:
 * `speechSynthesis` exposes no word timings, so a smooth fake progress bar
 * would be a lie. When server synthesis is configured the player switches to an
 * <audio> element and then reports true time-based progress.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/lib/user";
import { t, getLanguage } from "@/lib/i18n";
import { planVoice, prepareSpeechText, splitSentences, SPEEDS, type VoiceLike } from "@/lib/audio/tts";

export interface NarrationMeta {
  /** What is being read, e.g. "the story of Maa Shailaputri". */
  label: string;
  /** Shown under the player. Source and verification text for this text. */
  source?: string;
  /** Language of `text`, as an app language code. */
  lang: string;
}

export function NarrationPlayer({
  text,
  meta,
  compact = false,
}: {
  text: string;
  meta: NarrationMeta;
  compact?: boolean;
}) {
  const { state, setSettings } = useUser();
  const lang = meta.lang;
  const def = getLanguage(lang);
  const sentences = useMemo(() => splitSentences(prepareSpeechText(text)), [text]);

  const [voices, setVoices] = useState<VoiceLike[]>([]);
  const [voiceName, setVoiceName] = useState<string>(state.settings.audioVoice || "");
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState<number>(state.settings.audioRate || 1);
  const [volume, setVolume] = useState<number>(state.settings.audioVolume ?? 1);
  const [showTranscript, setShowTranscript] = useState(state.settings.transcriptOpen);
  const [supported, setSupported] = useState(true);
  const [serverMode, setServerMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stoppedRef = useRef(false);

  /* Read the device's voice list once, and again if the platform announces a
     change. Reported availability is never guessed. */
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const read = () => setVoices(window.speechSynthesis.getVoices() as unknown as VoiceLike[]);
    read();
    window.speechSynthesis.addEventListener?.("voiceschanged", read);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", read);
  }, []);

  /* Is a server speech service configured? Ask, do not assume. */
  useEffect(() => {
    let alive = true;
    fetch("/api/tts", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { configured?: boolean; languages?: string[] } | null) => {
        if (!alive || !j) return;
        setServerMode(Boolean(j.configured && (j.languages ?? []).includes(lang)));
      })
      .catch(() => {
        /* offline or blocked: device speech is the fallback, silently correct */
      });
    return () => {
      alive = false;
    };
  }, [lang]);

  const plan = useMemo(() => planVoice(lang, voices), [lang, voices]);

  /** Voices the reader may explicitly choose: those for this language first. */
  const choices = useMemo(() => {
    const primary = def.bcp47.toLowerCase().split("-")[0];
    const mine = voices.filter((v) => (v.lang || "").toLowerCase().split("-")[0] === primary);
    const rest = voices.filter((v) => (v.lang || "").toLowerCase().split("-")[0] !== primary);
    return { mine, rest };
  }, [voices, def.bcp47]);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    audioRef.current?.pause();
    setSpeaking(false);
    setPaused(false);
  }, []);

  /* Speech must stop when the reader leaves the page or changes text. */
  useEffect(() => stop, [stop, text]);

  const speakFrom = useCallback(
    (from: number) => {
      if (serverMode) {
        // Server mode: one request per sentence keeps the seek control exact and
        // keeps each request inside the route's character cap.
        stoppedRef.current = false;
        setSpeaking(true);
        setPaused(false);
        setIndex(from);
        const el = audioRef.current;
        if (!el) return;
        void fetch("/api/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text: sentences[from], lang }),
        })
          .then(async (r) => {
            if (!r.ok) throw new Error("tts");
            const blob = await r.blob();
            el.src = URL.createObjectURL(blob);
            await el.play();
          })
          .catch(() => {
            // Provider failed mid-way: fall back to device speech rather than
            // stopping dead, and let the reader see the mode change.
            setServerMode(false);
          });
        return;
      }

      if (!supported || !sentences.length) return;
      stoppedRef.current = false;
      window.speechSynthesis.cancel();
      setSpeaking(true);
      setPaused(false);
      setIndex(from);

      const start = Math.max(0, Math.min(from, sentences.length - 1));
      for (let i = start; i < sentences.length; i++) {
        if (stoppedRef.current) break;
        const u = new SpeechSynthesisUtterance(sentences[i]);
        u.lang = def.bcp47;
        u.rate = rate;
        u.volume = volume;
        const chosen =
          voices.find((v) => v.name === voiceName) ??
          plan.voice ??
          null;
        if (chosen?.name && typeof window !== "undefined") {
          const match = window.speechSynthesis.getVoices().find((v) => v.name === chosen.name);
          if (match) u.voice = match;
        }
        const at = i;
        u.onstart = () => setIndex(at);
        u.onend = () => {
          if (stoppedRef.current) return;
          if (at + 1 >= sentences.length) {
            setSpeaking(false);
            setPaused(false);
          }
        };
        u.onerror = () => {
          if (stoppedRef.current) return;
          setSpeaking(false);
          setPaused(false);
        };
        window.speechSynthesis.speak(u);
      }
    },
    [serverMode, supported, sentences, def.bcp47, lang, rate, volume, voices, voiceName, plan.voice],
  );

  const toggle = useCallback(() => {
    if (serverMode) {
      const el = audioRef.current;
      if (!el) return;
      if (el.paused) {
        if (!el.src) speakFrom(index);
        else {
          void el.play();
          setSpeaking(true);
          setPaused(false);
        }
      } else {
        el.pause();
        setPaused(true);
      }
      return;
    }
    if (!supported) return;
    if (speaking && !paused) {
      window.speechSynthesis.pause();
      setPaused(true);
    } else if (speaking && paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      speakFrom(index);
    }
  }, [serverMode, supported, speaking, paused, index, speakFrom]);

  const seekTo = useCallback(
    (i: number) => {
      const target = Math.max(0, Math.min(i, sentences.length - 1));
      stop();
      speakFrom(target);
    },
    [sentences.length, speakFrom, stop],
  );

  const percent = sentences.length ? Math.round(((index + (speaking ? 1 : 0)) / sentences.length) * 100) : 0;

  if (!sentences.length) return null;

  const unavailable = !serverMode && plan.mode === "none";

  return (
    <section
      aria-label={`${t(lang, "audio.title")} — ${meta.label}`}
      className="card p-4 sm:p-5"
      dir={def.dir === "rtl" ? "rtl" : "ltr"}
      lang={def.code}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.68rem] uppercase tracking-[0.18em]" style={{ color: "var(--gold)" }}>
            {t(lang, "audio.title")} · {def.native}
          </p>
          <p className="display mt-0.5 text-lg font-semibold" style={{ fontFamily: def.fontStack }}>
            {meta.label}
          </p>
          {meta.source && <p className="muted mt-1 text-xs leading-relaxed">{meta.source}</p>}
        </div>
        <span className="chip shrink-0" title={plan.reason}>
          {serverMode ? t(lang, "audio.humanRecording") : t(lang, "audio.deviceVoice")}
        </span>
      </div>

      {/* mode and voice honesty ------------------------------------------- */}
      <p className="muted mt-3 text-xs leading-relaxed" aria-live="polite">
        {unavailable ? plan.reason : plan.reason}
      </p>
      <p className="muted mt-1 text-[0.7rem]">
        {t(lang, "audio.languageNote")} · {t(lang, "audio.notAutoplay")}
      </p>

      {/* transport -------------------------------------------------------- */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={unavailable}
          aria-pressed={speaking && !paused}
          className="btn btn-primary !py-1.5 !px-3.5 text-sm disabled:opacity-50"
        >
          {speaking && !paused
            ? `❙❙ ${t(lang, "action.pause")}`
            : `▶ ${speaking && paused ? t(lang, "action.continue") : t(lang, "action.listen")}`}
        </button>
        <button type="button" onClick={stop} disabled={!speaking}
                className="btn btn-ghost !py-1.5 !px-3 text-sm disabled:opacity-40">
          ■ {t(lang, "action.stop")}
        </button>
        <button type="button" onClick={() => seekTo(0)} disabled={!sentences.length}
                className="btn btn-ghost !py-1.5 !px-3 text-sm">
          ↺ {t(lang, "action.restart")}
        </button>
        {!compact && (
          <button type="button" onClick={() => setShowTranscript((v) => !v)}
                  aria-expanded={showTranscript}
                  className="btn btn-ghost !py-1.5 !px-3 text-sm">
            ☰ {showTranscript ? t(lang, "action.hideTranscript") : t(lang, "action.showTranscript")}
          </button>
        )}
      </div>

      {/* progress + seek -------------------------------------------------- */}
      <div className="mt-3">
        <label className="muted mb-1 block text-[0.68rem]" htmlFor="narration-seek">
          {t(lang, "audio.seek")} · {t(lang, "audio.sentence", { n: index + 1, total: sentences.length })}
        </label>
        <input
          id="narration-seek"
          type="range"
          min={0}
          max={Math.max(0, sentences.length - 1)}
          value={index}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="w-full"
          aria-valuetext={`${t(lang, "audio.sentence", { n: index + 1, total: sentences.length })}`}
        />
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" role="progressbar"
             aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
             aria-label={t(lang, "audio.progress")} style={{ background: "var(--surface-3)" }}>
          <div className="h-full rounded-full transition-[width]"
               style={{ width: `${percent}%`, background: "var(--gold)" }} />
        </div>
      </div>

      {/* speed, volume, voice --------------------------------------------- */}
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <fieldset>
          <legend className="muted mb-1 text-[0.68rem]">{t(lang, "action.speed")}</legend>
          <div className="flex gap-1" role="group">
            {SPEEDS.map((sp) => (
              <button
                key={sp}
                type="button"
                aria-pressed={rate === sp}
                onClick={() => {
                  setRate(sp);
                  setSettings({ audioRate: sp });
                  if (speaking) seekTo(index);
                }}
                className="rounded-lg border px-2 py-1 text-xs"
                style={{
                  borderColor: rate === sp ? "var(--gold)" : "var(--line)",
                  background: rate === sp ? "var(--accent-soft)" : "transparent",
                }}
              >
                {sp}×
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="muted mb-1 block text-[0.68rem]" htmlFor="narration-volume">
            {t(lang, "action.volume")}
          </label>
          <input
            id="narration-volume"
            type="range" min={0} max={1} step={0.05}
            value={volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setSettings({ audioVolume: v });
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-full"
          />
        </div>

        <div>
          <label className="muted mb-1 block text-[0.68rem]" htmlFor="narration-voice">
            {t(lang, "action.voice")}
          </label>
          <select
            id="narration-voice"
            value={voiceName}
            onChange={(e) => {
              setVoiceName(e.target.value);
              setSettings({ audioVoice: e.target.value });
            }}
            className="w-full rounded-lg border px-2 py-1 text-xs"
            style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", color: "var(--ink)" }}
          >
            <option value="">{t(lang, "set.voiceAuto")}</option>
            {choices.mine.length > 0 && (
              <optgroup label={def.native}>
                {choices.mine.map((v) => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </optgroup>
            )}
            {choices.rest.length > 0 && (
              <optgroup label="Other languages (will read with that accent)">
                {choices.rest.map((v) => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* captions --------------------------------------------------------- */}
      {state.settings.captions && (
        <p className="mt-3 rounded-xl border px-3 py-2 text-sm leading-relaxed"
           style={{ borderColor: "var(--line)", background: "var(--surface-3)" }}
           aria-live="polite">
          <span className="muted mr-2 text-[0.65rem] uppercase tracking-[0.14em]">
            {t(lang, "action.captions")}
          </span>
          {sentences[index]}
        </p>
      )}

      {/* transcript ------------------------------------------------------- */}
      {showTranscript && !compact && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border p-3"
             style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
          <p className="muted mb-2 text-[0.68rem] uppercase tracking-[0.14em]">
            {t(lang, "audio.transcriptLang", { language: def.native })}
          </p>
          <ol className="space-y-1.5">
            {sentences.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => seekTo(i)}
                  className="w-full rounded-lg px-2 py-1 text-start text-sm leading-relaxed"
                  style={{
                    background: i === index ? "var(--accent-soft)" : "transparent",
                    color: i === index ? "var(--ink)" : "var(--ink-2)",
                  }}
                >
                  {s}
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {serverMode && (
        <audio
          ref={audioRef}
          onEnded={() => {
            if (index + 1 < sentences.length) speakFrom(index + 1);
            else {
              setSpeaking(false);
              setIndex(0);
            }
          }}
          className="mt-3 w-full"
          controls
        />
      )}
    </section>
  );
}

/**
 * A one-line availability note for languages the device cannot speak.
 * Used on article headers so the reader knows before pressing play.
 */
export function NarrationStatusLine({ lang }: { lang: string }) {
  const def = getLanguage(lang);
  const [plan, setPlan] = useState<{ mode: string; reason: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setPlan({ mode: "none", reason: `This device has no speech engine, so ${def.label} narration is text-only here.` });
      return;
    }
    const read = () => {
      const p = planVoice(lang, window.speechSynthesis.getVoices() as unknown as VoiceLike[]);
      setPlan({ mode: p.mode, reason: p.reason });
    };
    read();
    window.speechSynthesis.addEventListener?.("voiceschanged", read);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", read);
  }, [lang, def.label]);

  if (!plan) return null;
  const tone = plan.mode === "native" ? "var(--accent)" : "var(--muted)";
  return (
    <p className="muted text-xs" style={{ color: tone }}>
      {plan.mode === "native" ? t(lang, "status.voiceAvailable", { language: def.native })
        : plan.mode === "substitute" ? plan.reason
        : t(lang, "status.voiceUnavailable", { language: def.native })}
    </p>
  );
}
