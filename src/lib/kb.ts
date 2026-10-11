/**
 * Knowledge-base localisation helpers.
 *
 * Pure functions over `KbDocument`, so they can run on the server and in the
 * browser without importing the corpus. The rule they enforce is the app's
 * honesty rule: when a requested language has no reviewed translation, the
 * caller is told which parts fell back, so the UI can say so instead of
 * silently serving English in the middle of a localised page.
 */
import type { KbDocument, KbTranslation } from "@/lib/types";
import type { LangCode } from "@/lib/i18n";

export interface LocalisedKbDocument {
  title: string;
  summary: string;
  body: string[];
  /** Section heading of the document's section, localised where reviewed. */
  titleTranslated: boolean;
  summaryTranslated: boolean;
  bodyTranslated: boolean;
  /** True when the requested language changed nothing at all. */
  englishOnly: boolean;
}

const EMPTY: KbTranslation = {};

export function kbHref(doc: KbDocument): string {
  return `/kb/${doc.slug}`;
}

export function askGuideHref(question: string): string {
  return `/guide?q=${encodeURIComponent(question)}`;
}

/**
 * Localise one document.
 *
 * `isFallback(lang)` reports coverage for the UI dictionaries; a KB document
 * carries its own translation set, so the two are checked separately and the
 * document's own state wins for its own fields.
 */
export function localiseKbDocument(doc: KbDocument, lang: LangCode): LocalisedKbDocument {
  const tr = doc.translations?.[lang] ?? EMPTY;

  const title = tr.title?.trim() ? tr.title : doc.title;
  const summary = tr.summary?.trim() ? tr.summary : doc.summary;
  const body = tr.body && tr.body.length > 0 ? tr.body : doc.body;

  const titleTranslated = title !== doc.title;
  const summaryTranslated = summary !== doc.summary;
  const bodyTranslated = body !== doc.body;
  const englishOnly =
    lang === "en" || (!titleTranslated && !summaryTranslated && !bodyTranslated);

  return {
    title,
    summary,
    body,
    titleTranslated,
    summaryTranslated,
    bodyTranslated,
    englishOnly,
  };
}

/** Languages this document is available in, English always included. */
export function kbLanguages(doc: KbDocument): string[] {
  const set = new Set<string>(["en"]);
  for (const code of Object.keys(doc.translations ?? {})) {
    const t = doc.translations?.[code];
    if (t && (t.title || t.summary || (t.body && t.body.length > 0))) set.add(code);
  }
  return [...set].sort();
}

/** Per-language translation state, for the availability line on a doc page. */
export function kbLanguageState(doc: KbDocument, code: string): "full" | "partial" | "none" {
  const t = doc.translations?.[code];
  if (!t) return "none";
  const hasBody = !!t.body && t.body.length > 0;
  const hasTitle = !!t.title;
  const hasSummary = !!t.summary;
  if (hasBody && hasTitle && hasSummary) return "full";
  if (hasBody || hasTitle || hasSummary) return "partial";
  return "none";
}

/**
 * Plain text for narration: title, then the summary, then the body, with the
 * key points appended. Short by construction — the wording here is what gets
 * read aloud, so it stays in the document's own voice and never adds anything
 * the page does not say.
 */
export function kbNarrationText(doc: KbDocument, lang: LangCode): string {
  const d = localiseKbDocument(doc, lang);
  const points = d.bodyTranslated ? doc.keyPoints : doc.keyPoints;
  return [d.title, d.summary, ...d.body, ...(points.length ? points : [])].join("\n\n");
}


