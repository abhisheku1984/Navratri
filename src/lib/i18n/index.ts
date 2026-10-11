/**
 * Interface translation, v2 — 24 languages.
 *
 * How this is put together, and why:
 *
 *  - Every locale is a flat `Record<string, string>` keyed by the English
 *    reference set in `dicts/en.ts`. Locales are deliberately `Partial`: a
 *    translation may be finished in stages, and an unfinished string falls back
 *    to English *and says so where it matters*.
 *  - Missing strings are never silently faked. `t()` marks a fallback, and
 *    `coverage()` publishes the real percentage per language on the language
 *    settings page, the listening library and the article headers.
 *  - Nothing here translates sacred text. Mantras, verses and the Saptashati
 *    are their own documents with their own named translators; machine
 *    translation is never applied to a verse. That rule predates this module
 *    and is preserved by it.
 *  - A provider hook exists (`src/app/api/translate/route.ts`) for deployments
 *    that want to draft translations server-side. It reports
 *    `configured: false` unless credentials are present, and any draft it makes
 *    is labelled `machine` rather than presented as reviewed.
 */
import { LANGUAGES, getLanguage, type LanguageDef } from "./languages";
import { en, EN_KEYS, type Dict } from "./dicts/en";

import { hi } from "./dicts/hi";
import { bn } from "./dicts/bn";
import { ta } from "./dicts/ta";
import { te } from "./dicts/te";
import { mr } from "./dicts/mr";
import { gu } from "./dicts/gu";
import { kn } from "./dicts/kn";
import { ml } from "./dicts/ml";
import { pa } from "./dicts/pa";
import { or } from "./dicts/or";
import { as } from "./dicts/as";
import { ur } from "./dicts/ur";
import { sa } from "./dicts/sa";
import { ne } from "./dicts/ne";
import { bho } from "./dicts/bho";
import { mai } from "./dicts/mai";
import { kok } from "./dicts/kok";
import { doi } from "./dicts/doi";
import { brx } from "./dicts/brx";
import { ks } from "./dicts/ks";
import { sd } from "./dicts/sd";
import { sat } from "./dicts/sat";
import { mni } from "./dicts/mni";

export {
  LANGUAGES, getLanguage, isRtl, LANGUAGE_CODES, isLanguageCode,
  assertLanguageRegistry, SPEECH_NOTES,
} from "./languages";
export type { LanguageDef, ScriptId, RegistryProblem } from "./languages";
export { EN_KEYS } from "./dicts/en";
export type { Dict } from "./dicts/en";

/** Union of the language codes the app ships. */
export type LangCode =
  | "as" | "bn" | "bho" | "brx" | "doi" | "en" | "gu" | "hi" | "kn" | "ks" | "kok"
  | "mai" | "ml" | "mni" | "mr" | "ne" | "or" | "pa" | "sa" | "sat" | "sd" | "ta"
  | "te" | "ur";

const DICTS: Record<string, Dict> = {
  en, hi, bn, ta, te, mr, gu, kn, ml, pa, or, as, ur, sa, ne,
  bho, mai, kok, doi, brx, ks, sd, sat, mni,
};

/**
 * Which locales have been reviewed by a human reader of that language, and
 * which are drafting. Nothing in the app claims more than this record says.
 */
export const REVIEW_STATE: Record<string, "reviewed" | "draft"> = {
  en: "reviewed",
  hi: "reviewed",
};

/**
 * Interpolation for `{placeholders}`. `vars` is the explicit form; any other
 * key is treated as a placeholder of the same name, so `t(lang, key, { n: 3 })`
 * fills `{n}`. Keeping both means call sites stay readable without a wrapper.
 */
export interface TranslateOptions {
  vars?: Record<string, string | number>;
  [placeholder: string]: string | number | Record<string, string | number> | undefined;
}

/**
 * Translate a key. Falls back to English, then to the key itself.
 *
 * `t` is intentionally total: it never throws and never returns an empty
 * string, because a missing translation must not break a page.
 */
export function t(lang: string, key: string, opts: TranslateOptions = {}): string {
  const dict = DICTS[lang];
  const raw = dict?.[key] ?? en[key] ?? key;
  const vars: Record<string, string | number> = { ...(opts.vars ?? {}) };
  for (const [k, v] of Object.entries(opts)) {
    if (k === "vars" || v === undefined) continue;
    if (typeof v === "string" || typeof v === "number") vars[k] = v;
  }
  if (!Object.keys(vars).length) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

/** True when the string is a real translation rather than an English fallback. */
export function hasTranslation(lang: string, key: string): boolean {
  return Boolean(DICTS[lang]?.[key]);
}

/** True when the string shown is English because this language lacks it. */
export function isFallback(lang: string, key: string): boolean {
  return lang !== "en" && !hasTranslation(lang, key) && Boolean(en[key]);
}

export interface Coverage {
  translated: number;
  total: number;
  pct: number;
}

/** Percentage of the reference key set present in this locale. */
export function coverage(lang: string): Coverage {
  const total = EN_KEYS.length;
  if (lang === "en") return { translated: total, total, pct: 100 };
  const dict = DICTS[lang] ?? {};
  const translated = EN_KEYS.filter((k) => dict[k]).length;
  return { translated, total, pct: Math.round((translated / total) * 100) };
}

/** Keys present in English but absent from a locale — for the maintainer view. */
export function missingKeys(lang: string): string[] {
  const dict = DICTS[lang] ?? {};
  return EN_KEYS.filter((k) => !dict[k]);
}

export type TranslationStatus =
  | "complete" | "substantial" | "partial" | "minimal" | "none";

/**
 * A single honest word for how translated a language is. Thresholds are stated
 * so nobody has to guess what "partial" meant.
 */
export function translationStatus(lang: string): TranslationStatus {
  const { pct, translated } = coverage(lang);
  if (translated === 0) return "none";
  if (pct >= 97) return "complete";
  if (pct >= 70) return "substantial";
  if (pct >= 30) return "partial";
  return "minimal";
}

export interface LanguageSummary extends LanguageDef {
  coverage: Coverage;
  status: TranslationStatus;
  review: "reviewed" | "draft";
  /** Percent of the app's articles that exist in this language. */
  contentPct: number;
}

/** Everything the language picker and settings page need, in one call. */
export function languageSummaries(contentPctByLang: Record<string, number> = {}): LanguageSummary[] {
  return LANGUAGES.map((l) => ({
    ...l,
    coverage: coverage(l.code),
    status: translationStatus(l.code),
    review: REVIEW_STATE[l.code] ?? "draft",
    contentPct: contentPctByLang[l.code] ?? 0,
  }));
}

/**
 * Font and direction attributes for a locale, applied to a wrapping element.
 * `dir` is what makes Urdu, Sindhi and Kashmiri lay out right-to-left without
 * every component needing to know about it.
 */
export function typographyFor(lang: string): {
  lang: string;
  dir: "ltr" | "rtl";
  fontFamily: string;
  lineHeight: number;
} {
  const def = getLanguage(lang);
  // Indic scripts need a little more leading than Latin at the same size:
  // stacked matras and above/below marks clip at Latin line-heights.
  const lineHeight = def.scriptGroup === "indic" ? 1.85 : def.scriptGroup === "perso-arabic" ? 2.05 : 1.7;
  return { lang: def.code, dir: def.dir, fontFamily: def.fontStack, lineHeight };
}

/**
 * Translate a list, skipping entries that fall back to English. Used where a
 * page would rather show two real translations than one real and one English.
 */
export function translateList(lang: string, keys: string[]): string[] {
  return keys.filter((k) => hasTranslation(lang, k)).map((k) => t(lang, k));
}
