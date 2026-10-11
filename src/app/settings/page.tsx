"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user";
import { useOffline } from "@/components/offline";
import { getLocations } from "@/lib/content";
import { coverage, LANGUAGES, type LangCode } from "@/lib/i18n";
import type { ScriptMode, ThemeMode } from "@/lib/types";
import { Card, Notice, PageHeader, SectionHeading } from "@/components/ui";

export default function SettingsPage() {
  const { state, setSettings, resetAll, hydrated } = useUser();
  const offline = useOffline();
  const locations = getLocations();
  const [confirmClear, setConfirmClear] = useState(false);
  const s = state.settings;

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings"
                  sub="Reading, language, appearance and privacy. Everything is stored in this browser; nothing is sent to a server." />

      {!hydrated && <Notice tone="info">Reading your saved settings from this device…</Notice>}

      {/* -------------------------------------------------------- language */}
      <section className="mt-8" aria-labelledby="lang">
        <SectionHeading eyebrow="Language" title="Interface language"
                        sub="The interface chrome is translated. The scripture is not: the Sanskrit is the source text and the only complete translation in this build is English (Pargiter, 1904). That asymmetry is stated rather than hidden behind a switch that pretends otherwise." />
        <h2 id="lang" className="sr-only">Interface language</h2>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LANGUAGES.map((l) => {
            const cov = coverage(l.code);
            const chosen = s.language === l.code;
            return (
              <li key={l.code}>
                <Card className="flex h-full flex-col p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="deva display text-lg font-semibold">{l.native}</p>
                    <span className="chip">{l.label}</span>
                  </div>
                  <p className="muted text-xs">Scripture: {l.scripture}</p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full"
                       style={{ background: "var(--surface-3)" }}>
                    <div className="h-full rounded-full"
                         style={{
                           width: `${cov.pct}%`,
                           background: cov.pct === 100 ? "#2f855a" : "var(--gold)",
                         }} />
                  </div>
                  <p className="muted mt-2 text-xs">
                    {cov.translated} of {cov.total} interface strings
                    {cov.pct < 100 && " — English fills the gaps"}
                  </p>
                  <button
                    className={`btn mt-4 ${chosen ? "btn-primary" : "btn-ghost"}`}
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
          Launch languages are Hindi, English and Sanskrit (with transliteration), plus Telugu and
          Bengali at partial coverage. The data model carries a language code on every translatable
          field, so Tamil, Kannada, Marathi, Gujarati, Malayalam, Odia, Punjabi and Assamese need a
          translation file, not a redesign.
        </p>
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
