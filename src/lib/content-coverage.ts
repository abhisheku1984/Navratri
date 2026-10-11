/**
 * Per-language content coverage.
 *
 * The interface dictionaries in `src/lib/i18n/dicts` say how much of the UI is
 * translated. This module answers the other half of the question — how much of
 * the *library* exists in a language — by counting the knowledge-base
 * documents that carry a reviewed translation.
 *
 * "The library" here means the curated knowledge base (`src/content/kb`): the
 * section-wise articles that answer the 50 launch questions. Scripture is
 * deliberately excluded and never counted as "translated": the imported
 * Saptashati carries the Sanskrit text with editorial and dictionary-level
 * aids, not per-language renderings, and counting it would inflate the numbers.
 *
 * The numbers reported here are counts, not estimates. A document counts as
 * translated only when it carries translated body text for that language;
 * a document with only a title and summary translated is reported as partial
 * and is not counted.
 */
import { getKbDocuments, getKbSections, getLaunchQuestionMatrix, getSources } from "@/lib/content";
import { getScriptureManifest } from "@/lib/content";
import { LANGUAGES } from "@/lib/i18n";

export interface LanguageContentCoverage {
  /** Documents with translated body text. */
  translated: number;
  /** Documents with a partial translation (title or summary only). */
  partial: number;
  documents: number;
  /** `translated` as a percentage of `documents`, one decimal place. */
  pct: number;
}

export interface ContentCoverageReport {
  /** Total documents in the library. */
  total: number;
  /** Per-language counts, keyed by language code. All 24 codes are present. */
  coverage: Record<string, LanguageContentCoverage>;
}

function stateFor(doc: { translations?: Record<string, { title?: string; summary?: string; body?: string[] }> }, code: string): "full" | "partial" | "none" {
  const t = doc.translations?.[code];
  if (!t) return "none";
  if (t.body && t.body.length > 0) return "full";
  if (t.title || t.summary) return "partial";
  return "none";
}

export function languageContentCoverage(): ContentCoverageReport {
  const docs = getKbDocuments();
  const coverage: Record<string, LanguageContentCoverage> = {};

  for (const l of LANGUAGES) {
    let translated = 0;
    let partial = 0;
    for (const d of docs) {
      const state = stateFor(d, l.code);
      if (state === "full") translated += 1;
      else if (state === "partial") partial += 1;
    }
    coverage[l.code] = {
      translated,
      partial,
      documents: docs.length,
      pct: docs.length ? Math.round((translated / docs.length) * 1000) / 10 : 0,
    };
  }

  return { total: docs.length, coverage };
}

/** Compact `{ code: pct }` map for `languageSummaries()`. */
export function languageContentPct(): Record<string, number> {
  const { coverage } = languageContentCoverage();
  const out: Record<string, number> = {};
  for (const [code, c] of Object.entries(coverage)) out[code] = c.pct;
  return out;
}

/** Headline counts about the corpus, for Settings, /about and the tests. */
export function libraryStats(): {
  kbDocuments: number;
  kbSections: number;
  launchQuestions: number;
  sources: number;
  scriptureChapters: number;
  verseUnits: number;
} {
  const manifest = getScriptureManifest();
  return {
    kbDocuments: getKbDocuments().length,
    kbSections: getKbSections().length,
    launchQuestions: getLaunchQuestionMatrix().length,
    sources: getSources().length,
    scriptureChapters: manifest.chapters.length,
    verseUnits: manifest.verseUnitTotal,
  };
}
