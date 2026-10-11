"use client";

import { useState } from "react";
import { useUser } from "@/lib/user";
import type { ScriptMode } from "@/lib/types";
import { Notice } from "./ui";

/**
 * Sticky reading controls for the scripture reader.
 *
 * Font size, line spacing and script are applied through CSS custom properties
 * on <html> (see globals.css and useApplySettings), so the choice persists
 * across chapters and survives a reload.
 */
export function ReaderControls({ chapterId, verseCount }: { chapterId: string; verseCount: number }) {
  const { state, setSettings } = useUser();
  const s = state.settings;

  return (
    <div className="card mb-6 p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <fieldset className="flex items-center gap-2">
          <legend className="muted text-[0.68rem] uppercase tracking-[0.14em]">Script</legend>
          <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--line)" }}>
            {(["devanagari", "iast", "both"] as ScriptMode[]).map((m) => (
              <button key={m} type="button"
                      aria-pressed={s.script === m}
                      onClick={() => setSettings({ script: m })}
                      className="px-3 py-1.5 text-xs font-medium"
                      style={{
                        background: s.script === m ? "var(--accent)" : "transparent",
                        color: s.script === m ? "var(--surface)" : "var(--muted)",
                      }}>
                {m === "devanagari" ? "देवनागरी" : m === "iast" ? "IAST" : "Both"}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-2 text-xs">
          <span className="muted uppercase tracking-[0.14em]">Size</span>
          <input type="range" min={0.85} max={1.8} step={0.05} value={s.verseScale}
                 aria-label="Verse text size"
                 onChange={(e) => setSettings({ verseScale: Number(e.target.value) })}
                 className="h-1.5 w-28 accent-[var(--gold)]" />
          <span className="muted w-10 font-mono">{s.verseScale.toFixed(2)}×</span>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <span className="muted uppercase tracking-[0.14em]">Spacing</span>
          <input type="range" min={0.85} max={1.8} step={0.05} value={s.verseLine}
                 aria-label="Line spacing"
                 onChange={(e) => setSettings({ verseLine: Number(e.target.value) })}
                 className="h-1.5 w-28 accent-[var(--gold)]" />
          <span className="muted w-10 font-mono">{s.verseLine.toFixed(2)}×</span>
        </label>

        <button
          className="btn btn-ghost !px-3 !py-1.5 text-xs"
          aria-pressed={s.theme === "dark"}
          onClick={() => setSettings({ theme: s.theme === "dark" ? "light" : "dark" })}
        >
          {s.theme === "dark" ? "☀ Day reading" : "☾ Night reading"}
        </button>

        <span className="muted text-xs">{verseCount} verses · {chapterId}</span>
      </div>
    </div>
  );
}

/**
 * Jump-to-verse control. Verse labels are anchors in the document, so this is a
 * plain fragment navigation and works without JavaScript as well.
 */
export function VerseJump({ labels }: { labels: string[] }) {
  const [q, setQ] = useState("");
  const matches = q
    ? labels.filter((l) => l.includes(q.trim())).slice(0, 12)
    : [];
  return (
    <div className="relative">
      <label htmlFor="verse-jump" className="muted mb-1 block text-[0.68rem] uppercase tracking-[0.14em]">
        Jump to verse
      </label>
      <input
        id="verse-jump"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="e.g. 5.14"
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
        style={{ borderColor: "var(--line-strong)", background: "var(--surface)" }}
      />
      {matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border py-1"
            style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
          {matches.map((m) => (
            <li key={m}>
              <a href={`#${m}`} className="block px-3 py-1.5 font-mono text-sm hover:underline">{m}</a>
            </li>
          ))}
        </ul>
      )}
      {q && matches.length === 0 && (
        <p className="muted mt-1 text-xs">No verse with that number in this chapter.</p>
      )}
    </div>
  );
}

export function TranslationNotice() {
  return (
    <Notice tone="info" title="About the translation">
      The English is F. Eden Pargiter&rsquo;s 1904 translation of the Markandeya Purana, which is
      public domain. It is offered at <strong>chapter</strong> level, not verse level: the OCR
      witness&rsquo;s verse numbers are corrupt, so aligning them to the Sanskrit would fabricate a
      correspondence that cannot be checked. No machine translation is ever applied to sacred
      text. See <a href="/sources" className="link-underline">Sources &amp; verification</a>.
    </Notice>
  );
}
