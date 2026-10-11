"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@/lib/user";
import { EmptyState, Notice } from "./ui";

/* --------------------------------------------------------------- bookmarks */

export function BookmarkButton({
  kind, ref_, label, href,
}: { kind: "verse" | "chapter" | "anga" | "peetha" | "temple" | "topic" | "mantra" | "story";
     ref_: string; label: string; href: string }) {
  const { toggleBookmark, isBookmarked, hydrated } = useUser();
  const saved = hydrated && isBookmarked(href);
  return (
    <button
      className="btn btn-ghost !px-3 !py-1.5 text-xs"
      aria-pressed={saved}
      onClick={() => toggleBookmark({ kind, ref: ref_, label, href })}
    >
      <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}

export function FavouriteButton({ kind, id, label }: { kind: "peethas" | "temples"; id: string; label: string }) {
  const { toggleFavourite, isFavourite, hydrated } = useUser();
  const fav = hydrated && isFavourite(kind, id);
  return (
    <button
      className="btn btn-ghost !px-3 !py-1.5 text-xs"
      aria-pressed={fav}
      onClick={() => toggleFavourite(kind, id)}
    >
      <span aria-hidden="true">{fav ? "★" : "☆"}</span>
      {fav ? "Favourite" : "Add to pilgrimage list"}
      <span className="sr-only">: {label}</span>
    </button>
  );
}

/* ------------------------------------------------------- reading progress */

export function ReadingProgress({
  chapterId, verseLabels, onRatio,
}: { chapterId: string; verseLabels: string[]; onRatio?: (r: number) => void }) {
  const { state, setChapterProgress, hydrated } = useUser();
  const last = state.progress.scripture[chapterId];
  const ratio = state.progress.chapters[chapterId] ?? 0;

  useEffect(() => {
    if (!hydrated) return;
    const el = document.getElementById("verse-list");
    if (!el) return;
    const handler = () => {
      const rect = el.getBoundingClientRect();
      const r = (window.scrollY + window.innerHeight - rect.top) / (rect.height || 1);
      setChapterProgress(chapterId, Number(Math.max(0, Math.min(1, r)).toFixed(3)));
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, [hydrated, chapterId, setChapterProgress]);

  useEffect(() => { onRatio?.(ratio); }, [ratio, onRatio]);

  const idx = last ? verseLabels.indexOf(last) : -1;

  return (
    <div className="sticky top-[57px] z-20 -mx-4 mb-4 border-b px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border"
         style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--surface) 90%, transparent)" }}>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
          <div className="h-full rounded-full transition-[width] duration-300"
               style={{ width: `${Math.round(ratio * 100)}%`, background: "var(--gold)" }} />
        </div>
        <span className="muted shrink-0 font-mono text-xs">{Math.round(ratio * 100)}%</span>
      </div>
      {idx >= 0 && (
        <p className="muted mt-1 text-xs">
          Last read: <span className="font-mono">{last}</span>
          {idx + 1 < verseLabels.length && (
            <> · <a className="link-underline" href={`#${verseLabels[idx + 1]}`}>next verse</a></>
          )}
        </p>
      )}
    </div>
  );
}

export function VerseAnchor({ chapterId, label, children }: {
  chapterId: string; label: string; children: React.ReactNode;
}) {
  const { setVerseRead } = useUser();
  return (
    <div
      id={label}
      className="scroll-mt-28"
      onMouseEnter={() => setVerseRead(chapterId, label)}
      onFocus={() => setVerseRead(chapterId, label)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- audio player */

export interface AudioTrack {
  url: string | null;
  title: string;
  licence?: string;
}

/**
 * Audio player. Fully implemented (play, pause, seek, replay, speed) and
 * genuinely functional when a track URL is supplied.
 *
 * No track ships with this build: no licensed devotional audio was available to
 * verify, and the brief forbids using copyrighted audio without permission.
 * Rather than a decorative control that plays nothing, the player states its
 * configuration requirement and points at the documented way to add a track.
 */
export function AudioPlayer({ track }: { track: AudioTrack }) {
  const { state, setSettings } = useUser();
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.playbackRate = state.settings.audioRate;
  }, [state.settings.audioRate]);

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      if (el.paused) { await el.play(); setPlaying(true); }
      else { el.pause(); setPlaying(false); }
      setError(null);
    } catch {
      setError("This recording could not be played. Check the file and its licence.");
      setPlaying(false);
    }
  }, []);

  if (!track.url) {
    return (
      <div className="card p-5">
        <p className="mb-1 font-semibold">Audio not configured</p>
        <p className="muted text-sm leading-relaxed">
          This app&rsquo;s player is implemented — play, pause, seek, replay and speed all work —
          but no audio file ships with it. Devotional recordings are copyright works and will not
          be bundled without a verified licence. Add one by setting the track&rsquo;s
          <code className="mx-1 rounded px-1 text-xs" style={{ background: "var(--surface-3)" }}>audio.url</code>
          in <code className="mx-1 rounded px-1 text-xs" style={{ background: "var(--surface-3)" }}>src/content/mantras.json</code>
          together with its licence and last-verified date.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <audio
        ref={ref}
        src={track.url}
        preload="metadata"
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setPlaying(false)}
        onError={() => setError("Playback failed.")}
        className="hidden"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn btn-primary !px-4 !py-2" onClick={toggle}
                aria-label={playing ? "Pause" : "Play"}>
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="btn btn-ghost !px-3 !py-2" aria-label="Replay from start"
                onClick={() => { if (ref.current) { ref.current.currentTime = 0; ref.current.play(); setPlaying(true); } }}>
          ⟲
        </button>
        <div className="flex min-w-[10rem] flex-1 items-center gap-2">
          <label htmlFor={`rate-${track.title.slice(0, 6)}`} className="sr-only">Playback speed</label>
          <input
            id={`rate-${track.title.slice(0, 6)}`}
            type="range" min={0} max={1} step={0.001} value={duration ? time / duration : 0}
            aria-label="Seek"
            onChange={(e) => { if (ref.current) ref.current.currentTime = Number(e.target.value) * duration; }}
            className="h-1.5 flex-1 accent-[var(--gold)]"
          />
          <span className="muted font-mono text-xs">
            {Math.floor(time / 60)}:{String(Math.floor(time % 60)).padStart(2, "0")}
          </span>
        </div>
        <label className="muted flex items-center gap-2 text-xs">
          <span aria-hidden="true">Speed</span>
          <select
            className="rounded border px-1.5 py-1 text-xs"
            style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
            value={state.settings.audioRate}
            onChange={(e) => setSettings({ audioRate: Number(e.target.value) })}
          >
            {[0.75, 1, 1.25, 1.5].map((r) => <option key={r} value={r}>{r}×</option>)}
          </select>
        </label>
      </div>
      {error && <p className="mt-2 text-xs" style={{ color: "var(--maroon-500)" }}>{error}</p>}
      {track.licence && <p className="muted mt-2 text-xs">Licence: {track.licence}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------- quiz */

export function QuizRunner({ quiz }: { quiz: {
  id: string; title: string; topic: string;
  questions: { q: string; options: string[]; answer: number; why: string }[];
} }) {
  const { recordQuiz, state } = useUser();
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => answers.reduce<number>((a, v, i) => a + (v === quiz.questions[i].answer ? 1 : 0), 0),
    [answers, quiz.questions]);

  const prev = state.quizScores[quiz.id];

  return (
    <div>
      {prev && (
        <p className="muted mb-4 text-xs">
          Your last attempt: {prev.correct}/{prev.total}
        </p>
      )}
      <ol className="space-y-4">
        {quiz.questions.map((q, qi) => (
          <li key={qi} className="card p-5">
            <p className="mb-3 font-semibold">{qi + 1}. {q.q}</p>
            <fieldset disabled={submitted}>
              <legend className="sr-only">Options for question {qi + 1}</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  const correct = q.answer === oi;
                  const tone = !submitted ? (chosen ? "var(--gold)" : "var(--line)")
                    : correct ? "#2f855a" : chosen ? "var(--maroon-400)" : "var(--line)";
                  return (
                    <label key={oi}
                           className="flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm"
                           style={{ borderColor: tone,
                                    background: chosen ? "var(--accent-soft)" : "transparent" }}>
                      <input type="radio" name={`q${quiz.id}-${qi}`} className="mt-0.5"
                             checked={chosen}
                             onChange={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))} />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {submitted && (
              <p className="muted mt-3 border-t pt-3 text-xs leading-relaxed"
                 style={{ borderColor: "var(--line)" }}>
                {q.why}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!submitted ? (
          <button className="btn btn-primary"
                  disabled={answers.some((a) => a === null)}
                  onClick={() => { setSubmitted(true); recordQuiz(quiz.id, score, quiz.questions.length); }}>
            Check answers
          </button>
        ) : (
          <>
            <p className="display text-lg font-semibold">
              {score} / {quiz.questions.length}
            </p>
            <button className="btn btn-ghost"
                    onClick={() => { setSubmitted(false); setAnswers(quiz.questions.map(() => null)); }}>
              Try again
            </button>
          </>
        )}
      </div>

      {submitted && (
        <Notice tone="info">
          A score measures what you read, not what you are worth. Nothing here is a measure of
          devotion or merit.
        </Notice>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- flashcards */

export function Flashcards({ cards }: { cards: { front: string; back: string }[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const c = cards[i];
  if (!c) return <EmptyState title="No cards yet" body="Flashcards are generated from the glossary." />;
  return (
    <div>
      <button
        className="card flex min-h-[10rem] w-full items-center justify-center p-8 text-center"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show the term" : "Show the definition"}
      >
        <span className={flipped ? "text-sm leading-relaxed" : "deva text-3xl font-semibold"}>
          {flipped ? c.back : c.front}
        </span>
      </button>
      <div className="mt-4 flex items-center justify-between gap-3">
        <button className="btn btn-ghost"
                onClick={() => { setI((x) => (x - 1 + cards.length) % cards.length); setFlipped(false); }}>
          ← Previous
        </button>
        <span className="muted text-xs">{i + 1} / {cards.length}</span>
        <button className="btn btn-ghost"
                onClick={() => { setI((x) => (x + 1) % cards.length); setFlipped(false); }}>
          Next →
        </button>
      </div>
      <p className="muted mt-2 text-center text-xs">Tap the card to turn it over.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ map */

export interface MapMarker {
  id: string;
  name: string;
  sub: string;
  lat: number;
  lon: number;
  href: string;
}

/**
 * Leaflet map. Loaded lazily so the ~140 kB library is never fetched by users
 * who stay on text pages, and skipped entirely in low-data mode.
 *
 * Tiles come from OpenStreetMap in the browser. If they cannot be reached the
 * markers still render over a neutral background and the list below the map
 * still works, so the module degrades rather than breaking.
 */
export function PeethaMap({ markers, lowData, height = 460 }: {
  markers: MapMarker[]; lowData: boolean; height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (lowData || status !== "idle") return;
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        // Both are side-effect imports resolved on demand, so the ~140 kB
        // library and its stylesheet stay out of the initial page bundle.
        const [{ default: L }] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);
        if (cancelled || !containerRef.current) return;
        const map = L.map(containerRef.current, {
          center: [22.5, 80],
          zoom: 4,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        for (const m of markers) {
          L.circleMarker([m.lat, m.lon], {
            radius: 6, color: "#8d3446", weight: 2, fillColor: "#c9a227", fillOpacity: 0.9,
          })
            .addTo(map)
            .bindPopup(
              `<strong>${escapeHtml(m.name)}</strong><br>${escapeHtml(m.sub)}` +
              `<br><a href="${escapeHtml(m.href)}">Open profile</a>`,
            );
        }
        mapRef.current = map;
        setStatus("ready");
        setTimeout(() => map.invalidateSize(), 100);
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; };
  }, [lowData, markers, status]);

  if (lowData) {
    return (
      <Notice tone="info" title="Low-data mode is on">
        The map is not loaded. The full list of sites is below, and every entry is reachable from
        the list.
      </Notice>
    );
  }

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-2xl border"
        style={{ height, borderColor: "var(--line)", background: "var(--surface-3)" }}
        role="application"
        aria-label="Map of sacred sites. A list of every site follows below for screen readers."
      />
      {status === "loading" && <p className="muted mt-2 text-xs">Loading map…</p>}
      {status === "error" && (
        <p className="muted mt-2 text-xs">
          Map tiles could not be reached. The list below has every site and every coordinate.
        </p>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/* --------------------------------------------------------------- journal */

export function Journal() {
  const { state, addJournal, removeJournal, hydrated } = useUser();
  const [text, setText] = useState("");
  const [gratitude, setGratitude] = useState("");

  if (!hydrated) return null;

  return (
    <div id="journal">
      <div className="card p-5">
        <label htmlFor="journal-text" className="mb-1 block text-sm font-semibold">
          Prayer or reflection
        </label>
        <textarea
          id="journal-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border p-3 text-sm outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
          placeholder="What are you carrying today?"
        />
        <label htmlFor="journal-gratitude" className="mt-3 mb-1 block text-sm font-semibold">
          One thing you are grateful for
        </label>
        <input
          id="journal-gratitude"
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          className="w-full rounded-xl border p-3 text-sm outline-none"
          style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
        />
        <button
          className="btn btn-primary mt-3"
          disabled={!text.trim() && !gratitude.trim()}
          onClick={() => { addJournal(text.trim(), gratitude.trim() || undefined); setText(""); setGratitude(""); }}
        >
          Save entry
        </button>
        <p className="muted mt-2 text-xs">
          Stored only in this browser. Never uploaded. You can erase it all from Settings.
        </p>
      </div>

      <ul className="mt-4 space-y-3">
        {state.journal.length === 0 && (
          <li><EmptyState title="No entries yet"
                          body="Nothing is written until you write it. Your journal is private to this device." /></li>
        )}
        {state.journal.map((j) => (
          <li key={j.id} className="card p-4">
            <div className="muted mb-1.5 flex items-center justify-between text-xs">
              <time dateTime={j.date}>
                {new Date(j.date).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </time>
              <button className="text-xs underline" onClick={() => removeJournal(j.id)}>Delete</button>
            </div>
            {j.text && <p className="text-sm leading-relaxed">{j.text}</p>}
            {j.gratitude && (
              <p className="muted mt-2 text-sm"><span className="font-medium">Grateful for:</span> {j.gratitude}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
