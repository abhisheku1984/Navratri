"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { useOffline } from "@/components/offline";
import { getLocations } from "@/lib/content";
import {
  languageSummaries, getLanguage, t, REVIEW_STATE,
  type LangCode,
} from "@/lib/i18n";
import { blessingCoverage } from "@/lib/intro-data";
import { languageContentCoverage } from "@/lib/content-coverage";
import { LanguageSelector } from "@/components/language-selector";
import { ReplayIntroButton } from "@/components/intro";
import { narrationMatrix, type VoiceLike } from "@/lib/audio/tts";
import type { ScriptMode, ThemeMode } from "@/lib/types";
import { Card, Notice, PageHeader, SectionHeading } from "@/components/ui";

/** Font stack for a language code, from the registry (never a guess). */
const FONT = (code: string) => getLanguage(code).fontStack;

/** A small labelled progress bar. Percentages are counts, not estimates. */
function Score({ label, pct }: { label: string; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex justify-between text-[0.68rem]">
        <span className="muted">{label}</span>
        <span className="muted">{c1(clamped)}%</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full"
           style={{ background: "var(--surface-3)" }}>
        <div className="h-full rounded-full"
             style={{ width: `${clamped}%`, background: "var(--gold)" }} />
      </div>
    </div>
  );
}

function c1(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function SettingsPage() {
  const { state, setSettings, resetAll, hydrated } = useUser();
  const offline = useOffline();
  const locations = getLocations();
  const [confirmClear, setConfirmClear] = useState(false);
  const s = state.settings;
  const [voices, setVoices] = useState<VoiceLike[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices() as unknown as VoiceLike[]);
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => synth.removeEventListener?.("voiceschanged", load);
  }, []);

  const content = languageContentCoverage();
  const contentPctByLang: Record<string, number> = {};
  for (const [code, c] of Object.entries(content.coverage)) {
    contentPctByLang[code] = c.pct;
  }
  const summaries = languageSummaries(contentPctByLang);
  const summary = summaries.find((l) => l.code === s.language);
  const narration = narrationMatrix(voices);
  const bc = blessingCoverage();
  const blessingState =
    `${bc.total} languages — ${bc.authored} authored, ${bc.draft} awaiting native review`;
  const t2 = (lang: LangCode, key: string) => t(lang, key);

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings"
                  sub="Reading, language, appearance and privacy. Everything is stored in this browser; nothing is sent to a server." />

      {!hydrated && <Notice tone="info">Reading your saved settings from this device…</Notice>}

      {/* -------------------------------------------------------- language */}
      <section className="mt-8" aria-labelledby="lang">
        <SectionHeading
          eyebrow={t2(s.language, "nav.language")}
          title="24 languages, and exactly what is translated"
          sub="Two numbers are shown for every language: how much of the interface is translated, and how many of the library's articles exist in that language. Neither is estimated. Strings that have no translation fall back to English, are counted as fallbacks, and the article header tells you when it has happened."
        />
        <h2 id="lang" className="sr-only">Interface language</h2>

        <Card className="mb-4 p-5">
          <LanguageSelector variant="dialog" />
        </Card>

        {summary && (
          <Card className="mb-4 p-5">
            <p className="text-sm font-semibold">
              Current language: <span style={{ fontFamily: summary.fontStack }}>{summary.native}</span>{" "}
              <span className="muted">({summary.label}, {summary.code})</span>
            </p>
            <ul className="muted mt-2 space-y-1 text-xs leading-relaxed">
              <li>
                Interface: {summary.coverage.translated} of {summary.coverage.total} strings
                ({summary.coverage.pct}%) — status {summary.status}
              </li>
              <li>
                Articles: {content.coverage[summary.code]?.translated ?? 0} of {content.total} documents
                ({(summary.contentPct).toFixed(0)}%)
              </li>
              <li>
                Opening blessing: {blessingState} — {summary.code === "hi" ? "source text" : "translation"}
              </li>
              <li>
                Script: {summary.script}, direction {summary.dir.toUpperCase()} ·{" "}
                <span style={{ fontFamily: summary.fontStack }}>{summary.sample}</span>
              </li>
              <li>
                Review state: {REVIEW_STATE[summary.code] === "reviewed" ? "reviewed by a reader of the language" : "not yet reviewed by a native reader"}
              </li>
            </ul>
          </Card>
        )}

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaries.map((l) => {
            const chosen = s.language === l.code;
            return (
              <li key={l.code}>
                <Card className="flex h-full flex-col p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="display text-lg font-semibold" style={{ fontFamily: l.fontStack }} dir={l.dir}>
                      {l.native}
                    </p>
                    <span className="chip shrink-0" dir="ltr">{l.code} · {l.dir.toUpperCase()}</span>
                  </div>
                  <p className="muted text-xs">{l.label}</p>

                  <div className="mt-3 space-y-1.5">
                    <Score label="Interface" pct={l.coverage.pct} />
                    <Score label="Articles" pct={l.contentPct} />
                  </div>

                  <p className="muted mt-2 text-[0.68rem] leading-relaxed">
                    {l.status === "complete"
                      ? "Interface complete."
                      : l.status === "substantial"
                        ? "Substantial interface coverage; remaining strings show in English."
                        : l.status === "partial"
                          ? "Partial interface coverage; untranslated strings show in English."
                          : l.status === "minimal"
                            ? "Minimal coverage: navigation and key controls only, all verified."
                            : "No interface translation yet; the app runs in English."}
                    {" "}
                    {l.review === "reviewed" ? "Reviewed." : "Awaiting native review."}
                  </p>

                  <button
                    className={`btn mt-3 ${chosen ? "btn-primary" : "btn-ghost"}`}
                    aria-pressed={chosen}
                    onClick={() => setSettings({ language: l.code as LangCode })}
                  >
                    {chosen ? "In use" : "Choose"}
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>

        <p className="muted mt-3 text-sm leading-relaxed">
          Scripts are rendered from the font list recorded per language; where a listed font is
          absent the browser falls back to its own, and nothing is hidden. Urdu, Sindhi and
          Kashmiri switch the whole layout to right-to-left. No sacred text is machine-translated:
          mantras and verses carry named human sources or they are not shown as translated at all.
        </p>
      </section>

      {/* ----------------------------------------------------------- audio */}
      <section className="mt-10" aria-labelledby="audio">
        <SectionHeading
          eyebrow="Audio"
          title="Narration, voice by voice"
          sub="Narration follows the language you selected. Where the device has no voice for that language, the app says so and leaves the text as text rather than reading it in the wrong accent. No recorded recitation ships with this app — recitation recordings belong to their performers."
        />
        <h2 id="audio" className="sr-only">Narration</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={s.captions}
                     onChange={(e) => setSettings({ captions: e.target.checked })} />
              <span>
                <span className="block text-sm font-semibold">Show captions while narrating</span>
                <span className="muted block text-xs">
                  Displays the sentence being spoken under the player. Sentence-level, because that
                  is the only timing a browser speech engine actually reports.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" checked={s.transcriptOpen}
                     onChange={(e) => setSettings({ transcriptOpen: e.target.checked })} />
              <span>
                <span className="block text-sm font-semibold">Open transcripts by default</span>
                <span className="muted block text-xs">
                  Every narration player shows its full transcript, with clickable lines that seek.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3">
              <input type="checkbox" checked={s.skipIntro}
                     onChange={(e) => setSettings({ skipIntro: e.target.checked })} />
              <span>
                <span className="block text-sm font-semibold">Skip the opening experience</span>
                <span className="muted block text-xs">
                  The opening never plays twice on its own, whatever this is set to.
                </span>
              </span>
            </label>

            <div className="border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <p className="mb-2 text-sm font-semibold">Voice availability on this device</p>
              <ul className="grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {narration.map((n) => (
                  <li key={n.code} className="flex items-baseline gap-2">
                    <span aria-hidden="true"
                          style={{ color: n.mode === "native" ? "#2f855a" : n.mode === "substitute" ? "var(--gold)" : "var(--crimson, #9b2c2c)" }}>
                      {n.mode === "native" ? "●" : n.mode === "substitute" ? "◐" : "○"}
                    </span>
                    <span style={{ fontFamily: FONT(n.code) }}>{n.native}</span>
                    <span className="muted">
                      {n.mode === "native" ? "voice ready"
                        : n.mode === "substitute" ? `read with a ${n.substitutedWith} voice`
                        : "no voice — text only"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="muted mt-2 text-[0.7rem] leading-relaxed">
                ● native &nbsp; ◐ a related voice is used and labelled &nbsp; ○ nothing suitable: text
                only. This list is read from your device, so it changes with the device, and it is
                never reported as better than it is.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <ReplayIntroButton className="btn btn-ghost" />
              <Link href="/listen" className="btn btn-ghost">Open the listening library</Link>
            </div>
          </div>
        </Card>
      </section>

      {/* --------------------------------------------------------- reading */}
      <section className="mt-10" aria-labelledby="reading">
        <SectionHeading eyebrow="Reading" title="Text" />
        <h2 id="reading" className="sr-only">Text</h2>
        <Card className="p-6">
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Script for scripture</legend>
              <div className="flex flex-wrap gap-2">
                {(["devanagari", "iast", "both"] as ScriptMode[]).map((m) => (
                  <button key={m} className="chip" aria-pressed={s.script === m}
                          style={{ borderColor: s.script === m ? "var(--gold)" : "var(--line)" }}
                          onClick={() => setSettings({ script: m })}>
                    {m === "devanagari" ? "देवनागरी only" : m === "iast" ? "IAST only" : "Both"}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Verse text size — {s.verseScale.toFixed(2)}×
              </span>
              <input type="range" min={0.85} max={1.8} step={0.05} value={s.verseScale}
                     onChange={(e) => setSettings({ verseScale: Number(e.target.value) })}
                     className="h-1.5 w-full accent-[var(--gold)]" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Line spacing — {s.verseLine.toFixed(2)}×
              </span>
              <input type="range" min={0.85} max={1.8} step={0.05} value={s.verseLine}
                     onChange={(e) => setSettings({ verseLine: Number(e.target.value) })}
                     className="h-1.5 w-full accent-[var(--gold)]" />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold">
                Whole-page text size — {s.textScale.toFixed(2)}×
              </span>
              <input type="range" min={0.9} max={1.4} step={0.05} value={s.textScale}
                     onChange={(e) => setSettings({ textScale: Number(e.target.value) })}
                     className="h-1.5 w-full accent-[var(--gold)]" />
            </label>

            <p className="muted text-xs">
              Preview: <span className="verse-deva">या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता</span>{" "}
              <span className="verse-iast">yā devī sarvabhūteṣu śaktirūpeṇa saṁsthitā</span>
            </p>
          </div>
        </Card>
      </section>

      {/* ----------------------------------------------------- appearance */}
      <section className="mt-10" aria-labelledby="appearance">
        <SectionHeading eyebrow="Appearance" title="Theme, contrast and motion" />
        <h2 id="appearance" className="sr-only">Theme, contrast and motion</h2>
        <Card className="p-6">
          <div className="space-y-5">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Theme</legend>
              <div className="flex flex-wrap gap-2">
                {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
                  <button key={t} className="chip" aria-pressed={s.theme === t}
                          style={{ borderColor: s.theme === t ? "var(--gold)" : "var(--line)" }}
                          onClick={() => setSettings({ theme: t })}>
                    {t === "system" ? "Follow the system" : t === "dark" ? "Night reading" : "Day reading"}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={s.contrast === "high"}
                     onChange={(e) => setSettings({ contrast: e.target.checked ? "high" : "normal" })} />
              <span>
                <span className="block text-sm font-semibold">High contrast</span>
                <span className="muted block text-xs">
                  Deepens text colour and strengthens borders. Turns off the decorative
                  background wash.
                </span>
              </span>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={s.motion === "reduced"}
                     onChange={(e) => setSettings({ motion: e.target.checked ? "reduced" : "auto" })} />
              <span>
                <span className="block text-sm font-semibold">Reduce motion</span>
                <span className="muted block text-xs">
                  Stops the mandala spin, diya flicker and floating particles. When set to follow
                  the system, your OS preference is honoured automatically.
                </span>
              </span>
            </label>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------- location */}
      <section className="mt-10" aria-labelledby="location">
        <SectionHeading eyebrow="Panchang" title="Location for festival dates"
                        sub="Used to compute sunrise and therefore the tithi. This app does not ask for your birth details, and no feature here needs them." />
        <h2 id="location" className="sr-only">Location for festival dates</h2>
        <Card className="p-6">
          <label htmlFor="loc" className="mb-2 block text-sm font-semibold">City</label>
          <select id="loc" value={s.locationId}
                  onChange={(e) => setSettings({ locationId: e.target.value })}
                  className="w-full max-w-md rounded-lg border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}>
            {locations.locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.city}, {l.region}, {l.country} — {l.timezone}
              </option>
            ))}
          </select>
          <p className="muted mt-3 text-xs leading-relaxed">{locations.intro}</p>
        </Card>
      </section>

      {/* ---------------------------------------------------------- data */}
      <section className="mt-10" aria-labelledby="data">
        <SectionHeading eyebrow="Data" title="Low-data mode and privacy" />
        <h2 id="data" className="sr-only">Low-data mode and privacy</h2>
        <Card className="p-6">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={s.lowData}
                   onChange={(e) => setSettings({ lowData: e.target.checked })} />
            <span>
              <span className="block text-sm font-semibold">Low-data mode</span>
              <span className="muted block text-xs">
                Skips map tiles and does not load the Leaflet library. Text, scripture and search
                are unaffected.
              </span>
            </span>
          </label>

          <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <label className="flex items-start gap-3">
              <input type="checkbox" checked={s.offline} disabled={!offline.supported}
                     onChange={(e) => setSettings({ offline: e.target.checked })} />
              <span>
                <span className="block text-sm font-semibold">Offline reading</span>
                <span className="muted block text-xs">
                  Installs a service worker and lets you pin pages to read without a
                  connection. {!offline.supported
                    ? "This browser does not support service workers, so offline reading is unavailable."
                    : s.offline
                      ? offline.active
                        ? `Active. ${offline.cachedPaths.length} page${offline.cachedPaths.length === 1 ? "" : "s"} pinned.`
                        : "Starting…"
                      : "Off by default; nothing is intercepted while it is off."}
                </span>
              </span>
            </label>
          </div>

          <div className="mt-5 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <p className="mb-2 text-sm font-semibold">Your data</p>
            <p className="muted text-sm leading-relaxed">
              Bookmarks, reading progress, journal entries, quiz scores and these settings live in
              this browser&rsquo;s local storage under a single key. Nothing is uploaded, and there
              is no account. Clearing it here cannot be undone.
            </p>
            {confirmClear ? (
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button className="btn btn-primary"
                        onClick={() => { resetAll(); setConfirmClear(false); }}>
                  Yes, erase everything
                </button>
                <button className="btn btn-ghost" onClick={() => setConfirmClear(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn btn-ghost mt-3" onClick={() => setConfirmClear(true)}>
                Erase all my data
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5 border-t pt-5" style={{ borderColor: "var(--line)" }}>
            <Link href="/privacy" className="btn btn-ghost">Privacy policy</Link>
            <Link href="/terms" className="btn btn-ghost">Terms</Link>
            <Link href="/accessibility" className="btn btn-ghost">Accessibility</Link>
          </div>
        </Card>
      </section>
    </>
  );
}
